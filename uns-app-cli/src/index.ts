#!/usr/bin/env node
import { Command } from 'commander';
import { generateMapping } from './commands/mapping.js';
import { analyzeIntent } from './commands/intent.js';
import { planModules } from './commands/modules.js';
import { designUI } from './commands/design.js';
import { generateApp } from './commands/generate.js';

const program = new Command();

program
  .name('uns-app')
  .description('UNS-based Factory Application Generator CLI')
  .version('1.0.0');

// Main workflow command
program
  .command('create')
  .description('Create a new factory monitoring application (complete workflow)')
  .option('-u, --uns <path>', 'Path to UNS definition file', './uns/uns.json')
  .option('-b, --broker <url>', 'MQTT broker URL (optional)', '')
  .option('--skip-mapping', 'Skip UNS mapping generation', false)
  .action(async (options) => {
    console.log('\n🚀 Starting UNS App Creation Workflow\n');

    try {
      // Step 1: Generate UNS mapping
      if (!options.skipMapping) {
        console.log('📊 Step 1: Generating UNS mapping...');
        await generateMapping({
          unsPath: options.uns,
          brokerUrl: options.broker
        });
      }

      // Step 2: Analyze user intent
      console.log('\n🎯 Step 2: Analyzing application intent...');
      const intent = await analyzeIntent();

      // Step 3: Plan functional modules
      console.log('\n📦 Step 3: Planning functional modules...');
      const modules = await planModules({
        unsPath: options.uns,
        intent
      });

      // Step 4: Design UI
      console.log('\n🎨 Step 4: Designing user interface...');
      const uiDesign = await designUI({
        modules,
        intent
      });

      // Step 5: Generate application
      console.log('\n⚙️ Step 5: Generating application code...');
      const appInfo = await generateApp({
        unsPath: options.uns,
        intent,
        modules,
        uiDesign
      });

      console.log('\n✅ Application created successfully!');
      console.log(`📁 Location: ${appInfo.path}`);
      console.log(`🏷️ Name: ${appInfo.name}`);
      console.log(`🔗 Run: cd ${appInfo.path} && npm install && npm run dev`);

    } catch (error) {
      console.error('\n❌ Error creating application:', error);
      process.exit(1);
    }
  });

// Individual commands for step-by-step workflow
program
  .command('mapping')
  .description('Generate UNS topic mapping from local file or MQTT broker')
  .option('-u, --uns <path>', 'Path to UNS definition file', './uns/uns.json')
  .option('-b, --broker <url>', 'MQTT broker URL (optional)', '')
  .option('-o, --output <path>', 'Output path for mapping', './artifacts/uns_mapping.md')
  .action(async (options) => {
    await generateMapping(options);
  });

program
  .command('intent')
  .description('Analyze user intent (3-part input: type, industry, function)')
  .option('-o, --output <path>', 'Output path for intent analysis', './artifacts/intent.md')
  .action(async (options) => {
    await analyzeIntent(options);
  });

program
  .command('modules')
  .description('Plan functional modules based on UNS mapping and intent')
  .option('-u, --uns <path>', 'Path to UNS definition file', './uns/uns.json')
  .option('-i, --intent <path>', 'Path to intent file', './artifacts/intent.md')
  .option('-o, --output <path>', 'Output path for modules plan', './artifacts/modules.md')
  .action(async (options) => {
    await planModules(options);
  });

program
  .command('design')
  .description('Design UI based on modules and user requirements')
  .option('-m, --modules <path>', 'Path to modules file', './artifacts/modules.md')
  .option('-i, --intent <path>', 'Path to intent file', './artifacts/intent.md')
  .option('-o, --output <path>', 'Output path for UI design', './artifacts/ui_design.md')
  .action(async (options) => {
    await designUI(options);
  });

program
  .command('generate')
  .description('Generate web application code')
  .option('-u, --uns <path>', 'Path to UNS definition file', './uns/uns.json')
  .option('-i, --intent <path>', 'Path to intent file', './artifacts/intent.md')
  .option('-m, --modules <path>', 'Path to modules file', './artifacts/modules.md')
  .option('-d, --design <path>', 'Path to UI design file', './artifacts/ui_design.md')
  .option('-n, --name <name>', 'Application name (will be appended with UUID)')
  .action(async (options) => {
    await generateApp(options);
  });

// Legacy init command (kept for compatibility)
program
  .command('init')
  .description('[Legacy] Initialize a new UNS-based application')
  .action(() => {
    console.log('⚠️ The init command is deprecated. Please use "uns-app create" instead.');
    console.log('Run: uns-app create --help for more information.');
  });

program.parse(process.argv);