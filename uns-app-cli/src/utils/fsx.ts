import fs from 'fs-extra';
import path from 'path';

export async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest, {
    overwrite: true,
    errorOnExist: false,
  });
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

export async function pathExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

export async function readJSON(filePath: string): Promise<any> {
  return fs.readJSON(filePath);
}

export async function writeJSON(filePath: string, data: any): Promise<void> {
  await fs.writeJSON(filePath, data, { spaces: 2 });
}