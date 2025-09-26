import fs from 'fs';
import path from 'path';
import { UNSMapping } from './mapping.js';
import { UserIntent } from './intent.js';

export interface FunctionalModule {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  mqttTopics: string[];
  components: string[];
  dataFlow: {
    inputs: string[];
    outputs: string[];
    processing: string[];
  };
  uiElements: string[];
}

export interface ModulePlan {
  generatedAt: string;
  modules: FunctionalModule[];
  dependencies: {
    npm: string[];
    components: string[];
  };
  architecture: {
    pattern: string;
    layers: string[];
  };
}

export async function planModules(options: any): Promise<ModulePlan> {
  const unsPath = options.unsPath || './uns/uns.json';
  const intentPath = options.intent || './artifacts/intent.json';
  const outputPath = options.output || './artifacts/modules.json';

  // Load UNS mapping
  const unsData = JSON.parse(fs.readFileSync(unsPath, 'utf-8'));
  const mappingPath = './artifacts/uns_mapping.json';
  let mapping: UNSMapping;

  if (fs.existsSync(mappingPath)) {
    mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
  } else {
    // Generate mapping if not exists
    const { generateMapping } = require('./mapping');
    mapping = await generateMapping({ unsPath });
  }

  // Load intent
  let intent: UserIntent;
  if (typeof options.intent === 'object') {
    intent = options.intent;
  } else {
    intent = JSON.parse(fs.readFileSync(intentPath, 'utf-8'));
  }

  // Plan modules based on intent and UNS mapping
  const modules: FunctionalModule[] = [];

  // Core modules based on intent functions
  if (intent.functions.includes('realtime-monitoring')) {
    modules.push(createMonitoringModule(mapping));
  }

  if (intent.functions.includes('production-tracking')) {
    modules.push(createProductionModule(mapping));
  }

  if (intent.functions.includes('inventory-management')) {
    modules.push(createInventoryModule(mapping));
  }

  if (intent.functions.includes('order-management')) {
    modules.push(createOrderModule(mapping));
  }

  if (intent.functions.includes('equipment-maintenance')) {
    modules.push(createMaintenanceModule(mapping));
  }

  if (intent.functions.includes('alert-notifications')) {
    modules.push(createAlertModule(mapping));
  }

  if (intent.functions.includes('production-scheduling')) {
    modules.push(createSchedulingModule(mapping));
  }

  if (intent.functions.includes('kpi-dashboard')) {
    modules.push(createKPIModule(mapping));
  }

  // Always include MQTT connection module
  modules.unshift(createMQTTModule(mapping));

  // Create module plan
  const plan: ModulePlan = {
    generatedAt: new Date().toISOString(),
    modules,
    dependencies: {
      npm: [
        'react',
        'react-dom',
        'mqtt',
        'recharts',
        'tailwindcss',
        '@radix-ui/react-*',
        'date-fns',
        'clsx',
        'lucide-react'
      ],
      components: [
        'Card',
        'Button',
        'Badge',
        'Alert',
        'Tabs',
        'Progress',
        'ScrollArea',
        'Dialog'
      ]
    },
    architecture: {
      pattern: 'component-based',
      layers: [
        'presentation (React components)',
        'business logic (hooks & services)',
        'data layer (MQTT & state management)',
        'infrastructure (config & utils)'
      ]
    }
  };

  // Save module plan
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(plan, null, 2));

  // Also save as markdown
  const mdPath = outputPath.replace('.json', '.md');
  fs.writeFileSync(mdPath, generateModulesMarkdown(plan));

  console.log('✅ Module planning complete:', outputPath);
  console.log('📦 Planned modules:', modules.length);

  return plan;
}

function createMQTTModule(mapping: UNSMapping): FunctionalModule {
  return {
    id: 'mqtt-connection',
    name: 'MQTT连接管理',
    description: '管理MQTT broker连接，处理订阅和消息分发',
    priority: 'critical',
    mqttTopics: ['#'], // Will subscribe to configured topics
    components: ['MqttProvider', 'MqttContext', 'useMqtt'],
    dataFlow: {
      inputs: ['broker URL', 'credentials', 'topics'],
      outputs: ['connection status', 'messages'],
      processing: ['connection management', 'message parsing', 'event dispatching']
    },
    uiElements: ['ConnectionStatus', 'ConnectionIndicator']
  };
}

function createMonitoringModule(mapping: UNSMapping): FunctionalModule {
  return {
    id: 'realtime-monitoring',
    name: '实时监控',
    description: '显示实时生产数据和设备状态',
    priority: 'high',
    mqttTopics: mapping.categories.production,
    components: ['MonitoringDashboard', 'MetricsCard', 'StatusIndicator'],
    dataFlow: {
      inputs: ['sensor data', 'equipment status'],
      outputs: ['visualizations', 'alerts'],
      processing: ['data aggregation', 'threshold checking']
    },
    uiElements: ['LiveChart', 'GaugeChart', 'StatusBadge']
  };
}

function createProductionModule(mapping: UNSMapping): FunctionalModule {
  return {
    id: 'production-tracking',
    name: '生产追踪',
    description: '跟踪生产任务和工站状态',
    priority: 'high',
    mqttTopics: [
      ...mapping.categories.production,
      ...mapping.topics.actions.filter((t: any) => t.path.includes('task')).map((t: any) => t.path)
    ],
    components: ['ProductionStatus', 'StationCard', 'JobTracker'],
    dataFlow: {
      inputs: ['job status', 'station data', 'production metrics'],
      outputs: ['production reports', 'efficiency metrics'],
      processing: ['status tracking', 'efficiency calculation']
    },
    uiElements: ['StationGrid', 'JobList', 'ProgressBar']
  };
}

function createInventoryModule(mapping: UNSMapping): FunctionalModule {
  return {
    id: 'inventory-management',
    name: '库存管理',
    description: '监控材料库存水平',
    priority: 'medium',
    mqttTopics: mapping.categories.inventory,
    components: ['InventoryMonitor', 'StockCard', 'ReplenishmentAlert'],
    dataFlow: {
      inputs: ['stock levels', 'consumption rates'],
      outputs: ['low stock alerts', 'reorder suggestions'],
      processing: ['inventory calculation', 'threshold monitoring']
    },
    uiElements: ['StockLevelBar', 'MaterialList', 'AlertBanner']
  };
}

function createOrderModule(mapping: UNSMapping): FunctionalModule {
  return {
    id: 'order-management',
    name: '订单管理',
    description: '管理和跟踪生产订单',
    priority: 'high',
    mqttTopics: mapping.categories.orders,
    components: ['OrderManagement', 'OrderCard', 'PriorityIndicator'],
    dataFlow: {
      inputs: ['order data', 'priority levels'],
      outputs: ['order status', 'scheduling recommendations'],
      processing: ['priority sorting', 'due date tracking']
    },
    uiElements: ['OrderList', 'PriorityBadge', 'DueDateIndicator']
  };
}

function createMaintenanceModule(mapping: UNSMapping): FunctionalModule {
  return {
    id: 'equipment-maintenance',
    name: '设备维护',
    description: '监控设备健康和维护需求',
    priority: 'medium',
    mqttTopics: mapping.categories.molds,
    components: ['MoldMaintenance', 'MaintenanceCard', 'LifecycleTracker'],
    dataFlow: {
      inputs: ['equipment status', 'usage cycles', 'maintenance history'],
      outputs: ['maintenance alerts', 'replacement schedules'],
      processing: ['lifecycle tracking', 'predictive maintenance']
    },
    uiElements: ['MaintenanceSchedule', 'EquipmentHealth', 'UsageChart']
  };
}

function createAlertModule(mapping: UNSMapping): FunctionalModule {
  return {
    id: 'alert-notifications',
    name: '报警通知',
    description: '管理和显示系统报警',
    priority: 'critical',
    mqttTopics: ['*/alarms', '*/alerts'],
    components: ['AlarmNotifications', 'AlertCard', 'NotificationCenter'],
    dataFlow: {
      inputs: ['alarm triggers', 'threshold violations'],
      outputs: ['notifications', 'acknowledgments'],
      processing: ['alert routing', 'priority classification']
    },
    uiElements: ['AlertList', 'NotificationToast', 'AcknowledgeButton']
  };
}

function createSchedulingModule(mapping: UNSMapping): FunctionalModule {
  return {
    id: 'production-scheduling',
    name: '生产排程',
    description: '显示和管理生产计划',
    priority: 'medium',
    mqttTopics: mapping.categories.scheduling,
    components: ['SchedulingDashboard', 'PlanCard', 'QueueManager'],
    dataFlow: {
      inputs: ['production plans', 'queue status'],
      outputs: ['schedule updates', 'dispatch commands'],
      processing: ['schedule optimization', 'queue management']
    },
    uiElements: ['GanttChart', 'QueueList', 'ScheduleCalendar']
  };
}

function createKPIModule(mapping: UNSMapping): FunctionalModule {
  return {
    id: 'kpi-dashboard',
    name: 'KPI仪表盘',
    description: '显示关键绩效指标',
    priority: 'low',
    mqttTopics: mapping.topics.metrics.map((t: any) => t.path),
    components: ['KPIDashboard', 'MetricCard', 'TrendChart'],
    dataFlow: {
      inputs: ['production metrics', 'efficiency data'],
      outputs: ['KPI visualizations', 'trend analysis'],
      processing: ['metric aggregation', 'trend calculation']
    },
    uiElements: ['KPICard', 'TrendLine', 'ComparisonChart']
  };
}

function generateModulesMarkdown(plan: ModulePlan): string {
  return `# Functional Modules Plan

Generated: ${plan.generatedAt}

## Architecture
- **Pattern**: ${plan.architecture.pattern}
- **Layers**:
${plan.architecture.layers.map(l => `  - ${l}`).join('\n')}

## Modules (${plan.modules.length})

${plan.modules.map(m => `
### ${m.name} (${m.id})
- **Priority**: ${m.priority}
- **Description**: ${m.description}

#### MQTT Topics
${m.mqttTopics.slice(0, 5).map(t => `- ${t}`).join('\n')}
${m.mqttTopics.length > 5 ? `... and ${m.mqttTopics.length - 5} more` : ''}

#### Components
${m.components.map(c => `- ${c}`).join('\n')}

#### Data Flow
- **Inputs**: ${m.dataFlow.inputs.join(', ')}
- **Processing**: ${m.dataFlow.processing.join(', ')}
- **Outputs**: ${m.dataFlow.outputs.join(', ')}

#### UI Elements
${m.uiElements.map(u => `- ${u}`).join('\n')}
`).join('\n')}

## Dependencies

### NPM Packages
${plan.dependencies.npm.map(d => `- ${d}`).join('\n')}

### UI Components
${plan.dependencies.components.map(c => `- ${c}`).join('\n')}
`;
}