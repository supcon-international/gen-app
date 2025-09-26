import { z } from 'zod';
import { generateJSON } from '../ai/openai.js';
import { prompts } from '../ai/prompts.js';
import { prepareTemplate, getTemplateOverview } from './template.js';
import { writeFile, readFile, pathExists } from '../utils/fsx.js';
import { applyPatch } from '../utils/diff.js';
import { config } from '../config.js';
import { log } from '../utils/log.js';
import path from 'path';
import fs from 'fs-extra';

const FilePlanSchema = z.object({
  files: z.array(z.object({
    path: z.string(),
    type: z.enum(['create', 'modify']),
    description: z.string(),
    content: z.string().nullable().optional(),
    patches: z.array(z.object({
      oldText: z.string(),
      newText: z.string(),
    })).optional(),
  })),
});

type FilePlan = z.infer<typeof FilePlanSchema>;

export async function applyCodePlan(
  projectSpec: string,
  uiSpec: string,
  appKind: string
): Promise<string> {
  const appPath = await prepareTemplate(appKind);
  const templateOverview = await getTemplateOverview();

  log.info('Generating code plan...');

  let plan: FilePlan;
  try {
    plan = await generateJSON<FilePlan>(
      FilePlanSchema,
      prompts.codePlan.system,
      prompts.codePlan.user(projectSpec, uiSpec, templateOverview),
      { maxTokens: 4096, temperature: 0.5 }
    );

    // Debug: Save the plan to artifacts for inspection
    const planPath = path.join(config.paths.artifacts, 'last_code_plan.json');
    await fs.writeJSON(planPath, plan, { spaces: 2 });
    log.info(`Code plan saved to ${planPath}`);
  } catch (error: any) {
    log.error('Failed to generate code plan:', error.message);
    // Return with just template copied, no modifications
    log.warn('Returning app with template only (no customizations applied)');
    return appPath;
  }

  log.info(`Applying ${plan.files.length} file changes...`);

  for (const file of plan.files) {
    const filePath = path.join(appPath, file.path);
    log.info(`Processing: ${file.path}`);

    if (file.type === 'create') {
      if (file.content) {
        await writeFile(filePath, file.content);
        log.success(`Created: ${file.path}`);
      } else {
        log.warn(`No content provided for new file: ${file.path}`);
      }
    } else if (file.type === 'modify') {
      if (await pathExists(filePath)) {
        const currentContent = await readFile(filePath);

        if (file.patches && file.patches.length > 0) {
          try {
            log.info(`Applying ${file.patches.length} patches to ${file.path}`);
            const newContent = applyPatch(currentContent, file.patches);
            await writeFile(filePath, newContent);
            log.success(`Modified: ${file.path}`);
          } catch (error: any) {
            log.warn(`Failed to apply patches to ${file.path}: ${error.message}`);
            // Debug: Log the failed patch details
            log.warn(`Failed patch details: ${JSON.stringify(file.patches[0], null, 2).substring(0, 200)}...`);
            if (file.content) {
              log.info(`Falling back to full rewrite for ${file.path}`);
              await writeFile(filePath, file.content);
              log.success(`Rewritten: ${file.path}`);
            }
          }
        } else if (file.content) {
          await writeFile(filePath, file.content);
          log.success(`Rewritten: ${file.path}`);
        } else {
          log.warn(`No patches or content supplied for ${file.path}`);
        }
      } else {
        log.warn(`File not found for modification: ${file.path}`);
      }
    }
  }

  await generateCodeTree(appPath);

  return appPath;
}

async function generateCodeTree(appPath: string): Promise<void> {
  const files: string[] = [];
  const appName = path.basename(appPath);

  async function scanDir(dir: string, prefix = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist'].includes(entry.name)) {
          await scanDir(fullPath, relativePath);
        }
      } else if (entry.isFile()) {
        files.push(relativePath);
      }
    }
  }

  await scanDir(appPath);

  let content = `# Code Tree for ${appName}\n\n`;
  content += `Generated: ${new Date().toISOString()}\n\n`;
  content += `## File Structure\n\n`;

  files.sort().forEach(file => {
    const depth = file.split('/').length - 1;
    const indent = '  '.repeat(depth);
    const filename = path.basename(file);
    content += `${indent}- ${filename}\n`;
  });

  content += `\n## Key Components\n\n`;
  content += `- **src/**: Source code\n`;
  content += `- **public/**: Static assets\n`;
  content += `- **package.json**: Dependencies and scripts\n`;
  content += `- **tsconfig.json**: TypeScript configuration\n`;
  content += `- **vite.config.ts**: Build configuration\n`;

  const treePath = path.join(config.paths.artifacts, 'code_tree.md');
  await writeFile(treePath, content);
  log.success(`Code tree saved to ${treePath}`);
}
