#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tsxPath = join(__dirname, '..', 'node_modules', '.bin', 'tsx');
const cliPath = join(__dirname, '..', 'src', 'cli.ts');

const child = spawn(tsxPath, [cliPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env },
  shell: process.platform === 'win32'
});

child.on('error', (err) => {
  console.error('Failed to start CLI:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});