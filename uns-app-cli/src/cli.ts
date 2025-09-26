import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { validateConfig, config, hasMqttConfig } from './config.js';
import { inspectUNS } from './mqtt/inspect.js';
import { generateProjectSpec } from './spec/generateProjectSpec.js';
import { generateUISpec } from './spec/generateUISpec.js';
import { applyCodePlan } from './code/applyPlan.js';
import { runAndTest } from './test/runDev.js';
import { log } from './utils/log.js';
import fs from 'fs-extra';
import path from 'path';

const program = new Command();

program
  .name('uns-app')
  .description('CLI tool for generating industrial UNS/MQTT applications')
  .version('1.0.0');

program
  .command('init')
  .description('Start the application generation wizard')
  .action(async () => {
    const spinner = ora();
    try {
      await validateConfig();

      log.info('Welcome to UNS App Generator!');

      const { initialPrompt } = await inquirer.prompt([
        {
          type: 'input',
          name: 'initialPrompt',
          message: 'Describe your application in one sentence (type, industry, features):',
          validate: (input) => input.trim().length > 10 || 'Please provide a meaningful description',
        },
      ]);

      const intent = {
        app_kind: extractAppKind(initialPrompt),
        industry: extractIndustry(initialPrompt),
        features: extractFeatures(initialPrompt),
        initial_prompt: initialPrompt,
      };

      // Create timestamped artifact directory
      const { createRunSuffix } = await import('./code/template.js');
      const appSlug = intent.app_kind.toLowerCase().replace(/\s+/g, '-');
      const runSuffix = createRunSuffix();
      const artifactDir = path.join(config.paths.artifacts, `${appSlug}-${runSuffix}`);
      await fs.ensureDir(artifactDir);

      await fs.writeJSON(path.join(artifactDir, 'intent.json'), intent, { spaces: 2 });
      log.success(`Intent saved to ${path.relative(process.cwd(), artifactDir)}/intent.json`);

      spinner.start('Inspecting UNS topics...');
      const unsData = await inspectUNS(artifactDir);
      spinner.succeed('UNS inspection complete');

      spinner.start('Generating project specification...');
      const projectSpec = await generateProjectSpec(intent, unsData, artifactDir);
      spinner.succeed('Project specification generated');

      spinner.start('Generating UI specification...');
      const uiSpec = await generateUISpec(projectSpec, artifactDir);
      spinner.succeed('UI specification generated');

      spinner.start('Generating application code...');
      const appPath = await applyCodePlan(projectSpec, uiSpec, intent.app_kind);
      spinner.succeed(`Application code generated at ${appPath}`);

      spinner.start('Testing and fixing application...');
      const testResult = await runAndTest(appPath);
      spinner.succeed('Application tested successfully');

      log.info('\n✨ Application generation complete!');
      log.info(`   App Path: ${appPath}`);
      log.info(`   Start: cd ${appPath} && npm run dev`);
      log.info(`   Artifacts: ${artifactDir}`);

    } catch (error) {
      spinner.fail();
      log.error('Failed to generate application:', error);
      process.exit(1);
    }
  });

program
  .command('inspect')
  .description('Inspect UNS topics and generate overview')
  .action(async () => {
    const spinner = ora('Inspecting UNS topics...').start();
    try {
      await validateConfig();
      const unsData = await inspectUNS();
      spinner.succeed('UNS inspection complete');
      log.info(`Overview saved to ${path.join(config.paths.artifacts, 'uns_overview.md')}`);
    } catch (error) {
      spinner.fail();
      log.error('Inspection failed:', error);
      process.exit(1);
    }
  });

program
  .command('build')
  .description('Generate code based on existing specifications')
  .action(async () => {
    const spinner = ora();
    try {
      await validateConfig();

      const projectSpecPath = path.join(config.paths.artifacts, 'project_spec.md');
      const uiSpecPath = path.join(config.paths.artifacts, 'UI_spec.md');
      const intentPath = path.join(config.paths.artifacts, 'intent.json');

      if (!await fs.pathExists(projectSpecPath) || !await fs.pathExists(uiSpecPath)) {
        throw new Error('Missing specifications. Run "uns-app init" first');
      }

      const projectSpec = await fs.readFile(projectSpecPath, 'utf-8');
      const uiSpec = await fs.readFile(uiSpecPath, 'utf-8');
      const intent = await fs.readJSON(intentPath);

      spinner.start('Generating application code...');
      const appPath = await applyCodePlan(projectSpec, uiSpec, intent.app_kind);
      spinner.succeed(`Application code generated at ${appPath}`);

    } catch (error) {
      spinner.fail();
      log.error('Build failed:', error);
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Test and auto-fix the generated application')
  .option('-p, --path <path>', 'Application path to test')
  .action(async (options) => {
    const spinner = ora();
    try {
      await validateConfig();

      const appPath = options.path || await findLatestApp();
      if (!appPath) {
        throw new Error('No application found. Generate one first with "uns-app init"');
      }

      spinner.start('Testing and fixing application...');
      const testResult = await runAndTest(appPath);
      spinner.succeed('Application tested successfully');

      log.info('Test results saved to artifacts/test_report.md');

    } catch (error) {
      spinner.fail();
      log.error('Test failed:', error);
      process.exit(1);
    }
  });

function extractAppKind(prompt: string): string {
  const kinds = ['dashboard', 'monitor', 'control', 'analytics', 'reporting'];
  const lowered = prompt.toLowerCase();
  return kinds.find(k => lowered.includes(k)) || 'dashboard';
}

function extractIndustry(prompt: string): string {
  const industries = ['manufacturing', 'energy', 'automotive', 'logistics', 'chemical', 'pharmaceutical'];
  const lowered = prompt.toLowerCase();
  return industries.find(i => lowered.includes(i)) || 'industrial';
}

function extractFeatures(prompt: string): string[] {
  const features = [];
  const lowered = prompt.toLowerCase();

  if (lowered.includes('real-time') || lowered.includes('realtime')) features.push('real-time data');
  if (lowered.includes('chart') || lowered.includes('graph')) features.push('data visualization');
  if (lowered.includes('alert') || lowered.includes('alarm')) features.push('alerting');
  if (lowered.includes('report')) features.push('reporting');
  if (lowered.includes('control') || lowered.includes('command')) features.push('control actions');
  if (lowered.includes('history') || lowered.includes('trend')) features.push('historical data');

  return features.length > 0 ? features : ['real-time data', 'data visualization'];
}

async function findLatestApp(): Promise<string | null> {
  const appsDir = config.paths.apps;
  if (!await fs.pathExists(appsDir)) return null;

  const entries = await fs.readdir(appsDir);
  if (entries.length === 0) return null;

  const stats = await Promise.all(
    entries.map(async (entry) => ({
      path: path.join(appsDir, entry),
      mtime: (await fs.stat(path.join(appsDir, entry))).mtime,
    }))
  );

  stats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  return stats[0].path;
}

program.parse();