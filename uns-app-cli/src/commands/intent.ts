import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';

export interface UserIntent {
  appType: string;
  industry: string;
  functions: string[];
  generatedAt: string;
  expandedRequirements: {
    dataMonitoring: string[];
    userInteractions: string[];
    automations: string[];
    visualizations: string[];
  };
}

export async function analyzeIntent(options: any = {}): Promise<UserIntent> {
  const outputPath = options.output || './artifacts/intent.json';

  console.log('\n📝 Please provide your application requirements (3-part input):\n');

  // Interactive prompts for 3-part input
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'appType',
      message: '1. Application Type (应用类型):',
      choices: [
        { name: '监控大屏 (Monitoring Dashboard)', value: 'monitoring-dashboard' },
        { name: '管理系统 (Management System)', value: 'management-system' },
        { name: '控制面板 (Control Panel)', value: 'control-panel' },
        { name: '数据分析 (Data Analytics)', value: 'data-analytics' },
        { name: '报表系统 (Reporting System)', value: 'reporting-system' }
      ]
    },
    {
      type: 'list',
      name: 'industry',
      message: '2. Industry Domain (应用行业):',
      choices: [
        { name: '智能制造 (Smart Manufacturing)', value: 'manufacturing' },
        { name: '物流仓储 (Logistics & Warehouse)', value: 'logistics' },
        { name: '能源管理 (Energy Management)', value: 'energy' },
        { name: '质量控制 (Quality Control)', value: 'quality' },
        { name: '设备维护 (Equipment Maintenance)', value: 'maintenance' }
      ]
    },
    {
      type: 'checkbox',
      name: 'functions',
      message: '3. Core Functions (核心功能) - Select multiple:',
      choices: [
        { name: '实时数据监控 (Real-time Monitoring)', value: 'realtime-monitoring' },
        { name: '生产状态追踪 (Production Status)', value: 'production-tracking' },
        { name: '库存管理 (Inventory Management)', value: 'inventory-management' },
        { name: '订单管理 (Order Management)', value: 'order-management' },
        { name: '设备维护 (Equipment Maintenance)', value: 'equipment-maintenance' },
        { name: '质量追溯 (Quality Traceability)', value: 'quality-tracking' },
        { name: '报警通知 (Alert Notifications)', value: 'alert-notifications' },
        { name: '数据分析 (Data Analytics)', value: 'data-analytics' },
        { name: '生产排程 (Production Scheduling)', value: 'production-scheduling' },
        { name: 'KPI仪表盘 (KPI Dashboard)', value: 'kpi-dashboard' }
      ],
      validate: (answers) => {
        if (answers.length < 1) {
          return '请至少选择一个功能 (Please select at least one function)';
        }
        return true;
      }
    }
  ]);

  // Analyze and expand intent
  const intent: UserIntent = {
    appType: answers.appType,
    industry: answers.industry,
    functions: answers.functions,
    generatedAt: new Date().toISOString(),
    expandedRequirements: expandIntent(answers)
  };

  // Save intent
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(intent, null, 2));

  // Also save as markdown for human readability
  const mdPath = outputPath.replace('.json', '.md');
  fs.writeFileSync(mdPath, generateIntentMarkdown(intent));

  console.log('\n✅ Intent analysis complete:', outputPath);

  return intent;
}

function expandIntent(answers: any): any {
  const expanded: any = {
    dataMonitoring: [],
    userInteractions: [],
    automations: [],
    visualizations: []
  };

  // Expand based on app type
  switch (answers.appType) {
    case 'monitoring-dashboard':
      expanded.dataMonitoring.push('real-time-data-streaming');
      expanded.visualizations.push('charts', 'gauges', 'heatmaps');
      break;
    case 'management-system':
      expanded.userInteractions.push('crud-operations', 'form-submissions');
      expanded.dataMonitoring.push('database-sync');
      break;
    case 'control-panel':
      expanded.userInteractions.push('command-buttons', 'parameter-adjustments');
      expanded.automations.push('action-triggers');
      break;
  }

  // Expand based on industry
  switch (answers.industry) {
    case 'manufacturing':
      expanded.dataMonitoring.push('production-metrics', 'equipment-status');
      expanded.visualizations.push('production-flow', 'oee-metrics');
      break;
    case 'logistics':
      expanded.dataMonitoring.push('inventory-levels', 'shipment-tracking');
      expanded.visualizations.push('warehouse-map', 'delivery-status');
      break;
    case 'maintenance':
      expanded.dataMonitoring.push('equipment-health', 'maintenance-schedule');
      expanded.automations.push('predictive-maintenance');
      break;
  }

  // Expand based on functions
  if (answers.functions.includes('realtime-monitoring')) {
    expanded.dataMonitoring.push('mqtt-subscription', 'websocket-connection');
    expanded.visualizations.push('live-charts', 'status-indicators');
  }

  if (answers.functions.includes('production-tracking')) {
    expanded.dataMonitoring.push('job-status', 'production-rate');
    expanded.visualizations.push('gantt-chart', 'progress-bars');
  }

  if (answers.functions.includes('inventory-management')) {
    expanded.dataMonitoring.push('stock-levels', 'material-consumption');
    expanded.userInteractions.push('stock-adjustments', 'reorder-triggers');
  }

  if (answers.functions.includes('alert-notifications')) {
    expanded.automations.push('threshold-monitoring', 'alert-routing');
    expanded.userInteractions.push('alert-acknowledgment', 'notification-settings');
  }

  if (answers.functions.includes('equipment-maintenance')) {
    expanded.dataMonitoring.push('equipment-runtime', 'maintenance-history');
    expanded.automations.push('maintenance-scheduling', 'work-order-generation');
  }

  return expanded;
}

function generateIntentMarkdown(intent: UserIntent): string {
  return `# Application Intent Analysis

Generated: ${intent.generatedAt}

## User Requirements

### Application Type
**${intent.appType}**

### Industry Domain
**${intent.industry}**

### Core Functions
${intent.functions.map(f => `- ${f}`).join('\n')}

## Expanded Requirements

### Data Monitoring Needs
${intent.expandedRequirements.dataMonitoring.map(d => `- ${d}`).join('\n')}

### User Interactions
${intent.expandedRequirements.userInteractions.map(u => `- ${u}`).join('\n')}

### Automation Requirements
${intent.expandedRequirements.automations.map(a => `- ${a}`).join('\n')}

### Visualization Components
${intent.expandedRequirements.visualizations.map(v => `- ${v}`).join('\n')}

## Technical Requirements

Based on the analysis, the application will require:

1. **MQTT Integration** for real-time data streaming
2. **React + TypeScript** for type-safe development
3. **Responsive UI** with Tailwind CSS and shadcn/ui
4. **Data Visualization** with Recharts or similar
5. **State Management** with Context API or Zustand
6. **Real-time Updates** with WebSocket/MQTT subscriptions
`;
}