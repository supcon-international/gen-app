import { execa } from 'execa';
import { z } from 'zod';
import { generateJSON } from '../ai/openai.js';
import { prompts } from '../ai/prompts.js';
import { readFile, writeFile, pathExists } from '../utils/fsx.js';
import { applyPatch } from '../utils/diff.js';
import { log } from '../utils/log.js';
import { config } from '../config.js';
import path from 'path';

const HotfixPlanSchema = z.object({
  diagnosis: z.string(),
  fixes: z.array(z.object({
    path: z.string(),
    patches: z.array(z.object({
      oldText: z.string(),
      newText: z.string(),
    })),
  })),
});

type HotfixPlan = z.infer<typeof HotfixPlanSchema>;

interface TestResult {
  success: boolean;
  logs: string[];
  errors: string[];
  fixes: string[];
}

export async function runAndTest(appPath: string): Promise<TestResult> {
  const result: TestResult = {
    success: false,
    logs: [],
    errors: [],
    fixes: [],
  };

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries && !result.success) {
    attempt++;
    log.info(`Test attempt ${attempt}/${maxRetries}`);

    let devProcess: any | null = null;

    try {
      await installDependencies(appPath, result);

      const buildSucceeded = await runBuild(appPath, result);

      let hasErrors = !buildSucceeded;

      if (buildSucceeded) {
        devProcess = await startDevServer(appPath, result);
        await new Promise(resolve => setTimeout(resolve, 4000));
        hasErrors = checkForErrors(result.logs);
      }

      if (hasErrors && attempt < maxRetries) {
        log.warn('Errors detected, attempting auto-fix...');
        devProcess?.kill();

        await autoFix(appPath, result);
        result.fixes.push(`Fix attempt ${attempt} completed`);
      } else if (!hasErrors) {
        result.success = true;
        log.success('Application started successfully!');
      }

      if (devProcess && !devProcess.killed) {
        devProcess.kill();
      }
    } catch (error: any) {
      result.errors.push(error.message);
      log.error(`Test failed: ${error.message}`);
    }
  }

  await generateTestReport(result);
  await generateFixesReport(result);

  return result;
}

async function installDependencies(appPath: string, result: TestResult): Promise<void> {
  const packageJsonPath = path.join(appPath, 'package.json');

  if (!await pathExists(packageJsonPath)) {
    throw new Error('package.json not found');
  }

  const nodeModulesPath = path.join(appPath, 'node_modules');
  const lockFilePath = path.join(appPath, 'package-lock.json');

  const hasNodeModules = await pathExists(nodeModulesPath);
  const hasLockFile = await pathExists(lockFilePath);

  if (hasNodeModules && hasLockFile) {
    log.info('Reusing existing node_modules (skipping npm install)');
    return;
  }

  log.info('Installing dependencies...');

  try {
    const { stdout, stderr } = await execa('npm', ['install'], {
      cwd: appPath,
      timeout: 180000,
    });

    result.logs.push('=== NPM Install Output ===');
    if (stdout) result.logs.push(stdout);
    if (stderr) result.logs.push(stderr);
  } catch (error: any) {
    result.errors.push(`NPM install failed: ${error.message}`);
    throw error;
  }
}

async function runBuild(appPath: string, result: TestResult): Promise<boolean> {
  log.info('Running production build for smoke test...');

  try {
    const { stdout, stderr } = await execa('npm', ['run', 'build'], {
      cwd: appPath,
      env: { ...process.env, CI: 'true' },
      timeout: 180000,
    });

    result.logs.push('=== npm run build Output ===');
    if (stdout) result.logs.push(stdout);
    if (stderr) result.logs.push(stderr);
    return true;
  } catch (error: any) {
    result.errors.push(`Build failed: ${error.message}`);
    log.error('Build failed – see test report for details');
    return false;
  }
}

async function startDevServer(appPath: string, result: TestResult): Promise<any | null> {
  log.info('Starting development server...');

  try {
    const devProcess = execa('npm', ['run', 'dev'], {
      cwd: appPath,
      env: { ...process.env, CI: 'true' },
    });

    devProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      result.logs.push(output);

      if (output.includes('Local:') || output.includes('ready')) {
        log.success('Dev server started');
      }
    });

    devProcess.stderr?.on('data', (data) => {
      const output = data.toString();
      result.logs.push(output);

      if (isError(output)) {
        result.errors.push(output);
      }
    });

    return devProcess;
  } catch (error: any) {
    result.errors.push(`Dev server failed: ${error.message}`);
    return null;
  }
}

function checkForErrors(logs: string[]): boolean {
  const errorPatterns = [
    /error/i,
    /exception/i,
    /failed/i,
    /cannot find module/i,
    /unexpected token/i,
    /syntaxerror/i,
    /typeerror/i,
  ];

  const logText = logs.join('\n').toLowerCase();

  for (const pattern of errorPatterns) {
    if (pattern.test(logText)) {
      const ignorableErrors = [
        'error boundary',
        'error handler',
        'onerror',
        'catch error',
      ];

      const hasIgnorable = ignorableErrors.some(ie => logText.includes(ie));
      if (!hasIgnorable) {
        return true;
      }
    }
  }

  return false;
}

function isError(text: string): boolean {
  const lowerText = text.toLowerCase();
  return (
    lowerText.includes('error') ||
    lowerText.includes('failed') ||
    lowerText.includes('exception')
  ) && !lowerText.includes('error boundary');
}

async function autoFix(appPath: string, result: TestResult): Promise<void> {
  const recentErrors = result.errors.slice(-10).join('\n');
  const recentLogs = result.logs.slice(-50).join('\n');

  const affectedFiles: string[] = [];
  const errorContext = `${recentErrors}\n${recentLogs}`;

  const filePathMatches = errorContext.match(/[a-zA-Z0-9_\-/]+\.(tsx?|jsx?)/g);
  if (filePathMatches) {
    affectedFiles.push(...new Set(filePathMatches));
  }

  let affectedCode = '';
  for (const file of affectedFiles.slice(0, 3)) {
    const filePath = path.join(appPath, file);
    if (await pathExists(filePath)) {
      const content = await readFile(filePath);
      affectedCode += `\n=== ${file} ===\n${content.slice(0, 1000)}`;
    }
  }

  try {
    const hotfixPlan = await generateJSON<HotfixPlan>(
      HotfixPlanSchema,
      prompts.hotfixPlan.system,
      prompts.hotfixPlan.user(errorContext, affectedCode),
      { maxTokens: 4096, temperature: 0.3 }
    );

    log.info(`Applying fixes: ${hotfixPlan.diagnosis}`);

    for (const fix of hotfixPlan.fixes) {
      const filePath = path.join(appPath, fix.path);
      if (await pathExists(filePath)) {
        const content = await readFile(filePath);
        const fixed = applyPatch(content, fix.patches);
        await writeFile(filePath, fixed);
        log.success(`Fixed: ${fix.path}`);
      }
    }

    if (hotfixPlan.fixes.length > 0) {
      await verifyTypeCheck(appPath, result);
    }
  } catch (error) {
    log.error('Auto-fix failed:', error);
  }
}

async function verifyTypeCheck(appPath: string, result: TestResult): Promise<void> {
  const tsconfigPath = path.join(appPath, 'tsconfig.json');
  if (!await pathExists(tsconfigPath)) {
    return;
  }

  log.info('Running TypeScript check to validate fixes...');

  try {
    const { stdout, stderr } = await execa('npx', ['tsc', '--noEmit'], {
      cwd: appPath,
      env: { ...process.env, CI: 'true' },
      timeout: 120000,
    });

    if (stdout) result.logs.push(stdout);
    if (stderr) result.logs.push(stderr);
  } catch (error: any) {
    result.errors.push(`Type check failed: ${error.message}`);
    log.warn('Type check failed after auto-fix');
  }
}

async function generateTestReport(result: TestResult): Promise<void> {
  const reportPath = path.join(config.paths.artifacts, 'test_report.md');

  let content = `# Test Report\n\n`;
  content += `Generated: ${new Date().toISOString()}\n\n`;

  content += `## Summary\n\n`;
  content += `- Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}\n`;
  content += `- Errors: ${result.errors.length}\n`;
  content += `- Fixes Applied: ${result.fixes.length}\n\n`;

  if (result.errors.length > 0) {
    content += `## Errors\n\n`;
    result.errors.forEach((error, i) => {
      content += `${i + 1}. ${error}\n`;
    });
    content += '\n';
  }

  if (result.fixes.length > 0) {
    content += `## Fixes Applied\n\n`;
    result.fixes.forEach((fix, i) => {
      content += `${i + 1}. ${fix}\n`;
    });
    content += '\n';
  }

  content += `## Logs (last 50 lines)\n\n`;
  content += '```\n';
  content += result.logs.slice(-50).join('\n');
  content += '\n```\n';

  await writeFile(reportPath, content);
  log.info(`Test report saved to ${reportPath}`);
}

async function generateFixesReport(result: TestResult): Promise<void> {
  if (result.fixes.length === 0) return;

  const reportPath = path.join(config.paths.artifacts, 'fixes.md');

  let content = `# Applied Fixes\n\n`;
  content += `Generated: ${new Date().toISOString()}\n\n`;

  result.fixes.forEach((fix, i) => {
    content += `## Fix ${i + 1}\n\n`;
    content += `${fix}\n\n`;
  });

  await writeFile(reportPath, content);
  log.info(`Fixes report saved to ${reportPath}`);
}
