import { applyCodePlan } from './src/code/applyPlan.js';
import fs from 'fs-extra';
import path from 'path';

async function testApplyPlan() {
  try {
    const artifactDir = './artifacts/dashboard-20250925-144848';
    const projectSpec = await fs.readFile(path.join(artifactDir, 'project_spec.md'), 'utf-8');
    const uiSpec = await fs.readFile(path.join(artifactDir, 'UI_spec.md'), 'utf-8');

    console.log('Starting applyCodePlan test...');
    const appPath = await applyCodePlan(projectSpec, uiSpec, 'dashboard');
    console.log('Generated app at:', appPath);

    // Check if files were modified
    const appFile = await fs.readFile(path.join(appPath, 'src/App.tsx'), 'utf-8');
    const templateFile = await fs.readFile('./template/src/App.tsx', 'utf-8');

    if (appFile === templateFile) {
      console.log('❌ ERROR: App file is identical to template - no modifications applied!');
    } else {
      console.log('✅ SUCCESS: App file was modified!');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testApplyPlan();