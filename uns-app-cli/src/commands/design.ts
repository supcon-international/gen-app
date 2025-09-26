import fs from 'fs';
import path from 'path';
import { ModulePlan } from './modules.js';
import { UserIntent } from './intent.js';

export interface UIDesign {
  generatedAt: string;
  layout: {
    type: 'dashboard' | 'tabs' | 'sidebar' | 'grid';
    responsive: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  navigation: {
    type: 'tabs' | 'sidebar' | 'header';
    items: Array<{
      id: string;
      label: string;
      icon: string;
      moduleId: string;
    }>;
  };
  components: Array<{
    id: string;
    type: string;
    props: any;
    dataBinding: string[];
    position?: {
      grid?: string;
      order?: number;
    };
  }>;
  visualizations: {
    charts: string[];
    indicators: string[];
    tables: string[];
  };
  interactions: {
    buttons: Array<{ id: string; action: string; label: string }>;
    forms: Array<{ id: string; fields: string[] }>;
    modals: Array<{ id: string; trigger: string; content: string }>;
  };
  styling: {
    primaryColor: string;
    fontFamily: string;
    spacing: string;
    borderRadius: string;
  };
}

export async function designUI(options: any): Promise<UIDesign> {
  const modulesPath = options.modules || './artifacts/modules.json';
  const intentPath = options.intent || './artifacts/intent.json';
  const outputPath = options.output || './artifacts/ui_design.json';

  // Load modules and intent
  let modules: ModulePlan;
  let intent: UserIntent;

  if (typeof options.modules === 'object') {
    modules = options.modules;
  } else if (fs.existsSync(modulesPath)) {
    modules = JSON.parse(fs.readFileSync(modulesPath, 'utf-8'));
  } else {
    throw new Error('Modules plan not found. Please run "modules" command first.');
  }

  if (typeof options.intent === 'object') {
    intent = options.intent;
  } else if (fs.existsSync(intentPath)) {
    intent = JSON.parse(fs.readFileSync(intentPath, 'utf-8'));
  } else {
    throw new Error('Intent analysis not found. Please run "intent" command first.');
  }

  // Design UI based on app type and modules
  const design = createUIDesign(intent, modules);

  // Save UI design
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(design, null, 2));

  // Also save as markdown
  const mdPath = outputPath.replace('.json', '.md');
  fs.writeFileSync(mdPath, generateDesignMarkdown(design));

  console.log('✅ UI design complete:', outputPath);

  return design;
}

function createUIDesign(intent: UserIntent, modules: ModulePlan): UIDesign {
  const design: UIDesign = {
    generatedAt: new Date().toISOString(),
    layout: determineLayout(intent),
    navigation: createNavigation(modules),
    components: [],
    visualizations: {
      charts: [],
      indicators: [],
      tables: []
    },
    interactions: {
      buttons: [],
      forms: [],
      modals: []
    },
    styling: {
      primaryColor: 'hsl(221.2 83.2% 53.3%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacing: '1rem',
      borderRadius: '0.5rem'
    }
  };

  // Create components based on modules
  modules.modules.forEach((module: any) => {
    // Add navigation item
    if (module.id !== 'mqtt-connection') {
      // MQTT module is infrastructure, not UI

      // Create main container component for module
      design.components.push({
        id: `${module.id}-container`,
        type: 'ModuleContainer',
        props: {
          title: module.name,
          description: module.description
        },
        dataBinding: module.mqttTopics,
        position: {
          order: module.priority === 'critical' ? 1 :
                 module.priority === 'high' ? 2 :
                 module.priority === 'medium' ? 3 : 4
        }
      });

      // Add specific components based on module type
      if (module.id === 'realtime-monitoring') {
        design.visualizations.charts.push('LineChart', 'AreaChart', 'GaugeChart');
        design.visualizations.indicators.push('StatusLight', 'MetricCard');

        design.components.push({
          id: 'metrics-grid',
          type: 'Grid',
          props: { columns: 4, gap: '1rem' },
          dataBinding: ['metrics/*'],
          position: { grid: 'span 12' }
        });
      }

      if (module.id === 'production-tracking') {
        design.visualizations.charts.push('GanttChart', 'ProgressBar');
        design.visualizations.tables.push('JobTable');

        design.components.push({
          id: 'station-grid',
          type: 'Grid',
          props: { columns: 3, gap: '1rem' },
          dataBinding: ['*/state/current-job'],
          position: { grid: 'span 12' }
        });

        design.interactions.buttons.push({
          id: 'start-job',
          action: 'START_JOB',
          label: '启动任务'
        });
      }

      if (module.id === 'inventory-management') {
        design.visualizations.charts.push('BarChart', 'PieChart');
        design.visualizations.indicators.push('ProgressBar', 'StockLevel');

        design.components.push({
          id: 'inventory-cards',
          type: 'CardGrid',
          props: { columns: 2 },
          dataBinding: ['warehouse/state/inventory-*'],
          position: { grid: 'span 6' }
        });

        design.interactions.forms.push({
          id: 'stock-adjustment',
          fields: ['material_id', 'quantity', 'reason']
        });
      }

      if (module.id === 'order-management') {
        design.visualizations.tables.push('OrderTable');
        design.visualizations.indicators.push('PriorityBadge', 'DueDateTag');

        design.components.push({
          id: 'order-list',
          type: 'List',
          props: { sortable: true, filterable: true },
          dataBinding: ['erp/state/order-registry'],
          position: { grid: 'span 12' }
        });

        design.interactions.buttons.push({
          id: 'dispatch-order',
          action: 'DISPATCH_ORDER',
          label: '调度订单'
        });
      }

      if (module.id === 'equipment-maintenance') {
        design.visualizations.charts.push('RadialBar', 'Timeline');
        design.visualizations.indicators.push('HealthScore', 'CycleCounter');

        design.components.push({
          id: 'maintenance-cards',
          type: 'CardGrid',
          props: { columns: 2 },
          dataBinding: ['*/state/current-mold'],
          position: { grid: 'span 6' }
        });

        design.interactions.modals.push({
          id: 'maintenance-schedule',
          trigger: 'schedule-button',
          content: 'MaintenanceForm'
        });
      }

      if (module.id === 'alert-notifications') {
        design.visualizations.indicators.push('AlertBanner', 'NotificationBell');

        design.components.push({
          id: 'alert-panel',
          type: 'AlertPanel',
          props: { maxAlerts: 10, autoHide: false },
          dataBinding: ['*/alarms', '*/alerts'],
          position: { grid: 'span 12', order: 0 }
        });

        design.interactions.buttons.push({
          id: 'acknowledge-alert',
          action: 'ACKNOWLEDGE_ALERT',
          label: '确认'
        });
      }
    }
  });

  return design;
}

function determineLayout(intent: UserIntent): UIDesign['layout'] {
  switch (intent.appType) {
    case 'monitoring-dashboard':
      return {
        type: 'dashboard',
        responsive: true,
        theme: 'auto'
      };
    case 'management-system':
      return {
        type: 'sidebar',
        responsive: true,
        theme: 'light'
      };
    case 'control-panel':
      return {
        type: 'grid',
        responsive: false,
        theme: 'dark'
      };
    default:
      return {
        type: 'tabs',
        responsive: true,
        theme: 'auto'
      };
  }
}

function createNavigation(modules: ModulePlan): UIDesign['navigation'] {
  const navItems = modules.modules
    .filter((m: any) => m.id !== 'mqtt-connection')
    .map((module: any) => ({
      id: `nav-${module.id}`,
      label: module.name,
      icon: getModuleIcon(module.id),
      moduleId: module.id
    }));

  return {
    type: 'tabs',
    items: navItems
  };
}

function getModuleIcon(moduleId: string): string {
  const iconMap: Record<string, string> = {
    'realtime-monitoring': 'Activity',
    'production-tracking': 'Factory',
    'inventory-management': 'Package',
    'order-management': 'ShoppingCart',
    'equipment-maintenance': 'Wrench',
    'alert-notifications': 'Bell',
    'production-scheduling': 'Calendar',
    'kpi-dashboard': 'TrendingUp'
  };

  return iconMap[moduleId] || 'Grid';
}

function generateDesignMarkdown(design: UIDesign): string {
  return `# UI Design Specification

Generated: ${design.generatedAt}

## Layout
- **Type**: ${design.layout.type}
- **Responsive**: ${design.layout.responsive ? 'Yes' : 'No'}
- **Theme**: ${design.layout.theme}

## Navigation
- **Type**: ${design.navigation.type}
- **Items**: ${design.navigation.items.length}
${design.navigation.items.map(item => `  - ${item.label} (${item.icon})`).join('\n')}

## Components (${design.components.length})
${design.components.map(comp => `
### ${comp.id}
- **Type**: ${comp.type}
- **Data Binding**: ${comp.dataBinding.join(', ')}
- **Position**: ${comp.position?.grid || 'auto'}
`).join('\n')}

## Visualizations

### Charts
${design.visualizations.charts.map(c => `- ${c}`).join('\n')}

### Indicators
${design.visualizations.indicators.map(i => `- ${i}`).join('\n')}

### Tables
${design.visualizations.tables.map(t => `- ${t}`).join('\n')}

## Interactions

### Buttons (${design.interactions.buttons.length})
${design.interactions.buttons.map(b => `- ${b.label}: ${b.action}`).join('\n')}

### Forms (${design.interactions.forms.length})
${design.interactions.forms.map(f => `- ${f.id}: [${f.fields.join(', ')}]`).join('\n')}

### Modals (${design.interactions.modals.length})
${design.interactions.modals.map(m => `- ${m.id}: ${m.content}`).join('\n')}

## Styling
- **Primary Color**: ${design.styling.primaryColor}
- **Font**: ${design.styling.fontFamily}
- **Spacing**: ${design.styling.spacing}
- **Border Radius**: ${design.styling.borderRadius}
`;
}