import fs from 'fs-extra';
import path from 'path';
import { config } from '../config.js';

/**
 * Creates a timestamp suffix for artifact directories
 */
export function createRunSuffix(): string {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${date}-${time}`;
}

/**
 * Prepares artifact directory with timestamp and returns the path
 */
export async function prepareArtifactDir(appKind: string): Promise<string> {
  const appSlug = appKind.toLowerCase().replace(/\s+/g, '-');
  const runSuffix = createRunSuffix();
  const artifactPath = path.join(config.paths.artifacts, `${appSlug}-${runSuffix}`);

  await fs.ensureDir(artifactPath);

  // Create a "latest" symlink for convenience
  const latestSymlink = path.join(config.paths.artifacts, 'latest');

  // Remove old symlink if it exists
  if (await fs.pathExists(latestSymlink)) {
    const stats = await fs.lstat(latestSymlink);
    if (stats.isSymbolicLink() || stats.isFile() || stats.isDirectory()) {
      await fs.remove(latestSymlink);
    }
  }

  // Create new symlink
  try {
    await fs.ensureSymlink(artifactPath, latestSymlink, 'dir');
  } catch (error) {
    // If symlinks are not supported, just skip creating the symlink
    console.log('Note: Could not create symlink for latest artifacts');
  }

  return artifactPath;
}

/**
 * Gets the current artifact directory path
 */
let currentArtifactDir: string | null = null;

export function setCurrentArtifactDir(dir: string): void {
  currentArtifactDir = dir;
}

export function getCurrentArtifactDir(): string {
  if (!currentArtifactDir) {
    // Fallback to default artifacts directory
    return config.paths.artifacts;
  }
  return currentArtifactDir;
}

/**
 * Saves a file to the current artifact directory
 */
export async function saveArtifact(filename: string, content: string | object): Promise<string> {
  const artifactDir = getCurrentArtifactDir();
  const filePath = path.join(artifactDir, filename);

  if (typeof content === 'object') {
    await fs.writeJSON(filePath, content, { spaces: 2 });
  } else {
    await fs.writeFile(filePath, content, 'utf-8');
  }

  return filePath;
}