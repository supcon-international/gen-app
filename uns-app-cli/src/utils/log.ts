import chalk from 'chalk';

export const log = {
  info: (...args: any[]) => console.log(chalk.blue('ℹ'), ...args),
  success: (...args: any[]) => console.log(chalk.green('✓'), ...args),
  error: (...args: any[]) => console.error(chalk.red('✗'), ...args),
  warn: (...args: any[]) => console.warn(chalk.yellow('⚠'), ...args),
};