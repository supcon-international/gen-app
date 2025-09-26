import { copyDirectory, pathExists } from '../utils/fsx.js';
import { config } from '../config.js';
import path from 'path';
import fs from 'fs-extra';

export function createRunSuffix(): string {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${date}-${time}`;
}

export async function prepareTemplate(appKind: string): Promise<string> {
  const templatePath = config.paths.templates;
  const appSlug = appKind.toLowerCase().replace(/\s+/g, '-');
  const runSuffix = createRunSuffix();
  const runPath = path.join(config.paths.apps, `${appSlug}-${runSuffix}`);
  const latestSymlink = path.join(config.paths.apps, appSlug);

  await fs.ensureDir(config.paths.apps);

  await copyDirectory(templatePath, runPath);

  // Refresh "latest" symlink to point at the newest run
  if (await pathExists(latestSymlink)) {
    const stats = await fs.lstat(latestSymlink);
    if (stats.isSymbolicLink() || stats.isFile()) {
      await fs.remove(latestSymlink);
    }
  }

  try {
    await fs.ensureSymlink(runPath, latestSymlink, 'dir');
  } catch (error) {
    // If symlinks are not supported (e.g. on Windows without privileges), fall back to copying
    await fs.remove(latestSymlink);
    await copyDirectory(runPath, latestSymlink);
  }

  return runPath;
}

export async function getTemplateOverview(): Promise<string> {
  const templatePath = config.paths.templates;
  const files: string[] = [];

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
        const ext = path.extname(entry.name);
        if (['.ts', '.tsx', '.js', '.jsx', '.json'].includes(ext)) {
          files.push(relativePath);
        }
      }
    }
  }

  await scanDir(templatePath);

  return `Template structure:\n${files.map(f => `- ${f}`).join('\n')}`;
}
