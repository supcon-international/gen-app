import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { execSync } from 'child_process';

export interface AppInfo {
  name: string;
  path: string;
  uuid: string;
  createdAt: string;
}

export async function generateApp(options: any): Promise<AppInfo> {
  const unsPath = options.unsPath || './uns/uns.json';
  const intentPath = options.intent || './artifacts/intent.json';
  const modulesPath = options.modules || './artifacts/modules.json';
  const designPath = options.design || './artifacts/ui_design.json';

  // Generate app name with UUID
  const uuid = uuidv4().substring(0, 8);
  const appName = options.name || `factory-app-${uuid}`;
  const appPath = path.join(process.cwd(), 'apps', appName);

  console.log(`\n🏗️ Generating application: ${appName}`);

  // Load all artifacts
  const intent = typeof options.intent === 'object'
    ? options.intent
    : JSON.parse(fs.readFileSync(intentPath, 'utf-8'));

  const modules = typeof options.modules === 'object'
    ? options.modules
    : JSON.parse(fs.readFileSync(modulesPath, 'utf-8'));

  const design = typeof options.uiDesign === 'object'
    ? options.uiDesign
    : fs.existsSync(designPath)
      ? JSON.parse(fs.readFileSync(designPath, 'utf-8'))
      : null;

  // Copy template
  const templatePath = path.join(__dirname, '../../template');
  console.log('📋 Copying template from:', templatePath);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found at ${templatePath}`);
  }

  fs.copySync(templatePath, appPath);
  console.log('✅ Template copied to:', appPath);

  // Update package.json with app name
  const packageJsonPath = path.join(appPath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  packageJson.name = appName;
  packageJson.description = `${intent.appType} for ${intent.industry}`;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Generate MQTT configuration
  await generateMQTTConfig(appPath, unsPath);

  // Generate components based on modules
  await generateComponents(appPath, modules, design);

  // Generate main App.tsx
  await generateMainApp(appPath, modules, design, intent);

  // Update environment variables
  const envPath = path.join(appPath, '.env');
  const envContent = `
# MQTT Configuration
VITE_MQTT_BROKER_URL=wss://broker.hivemq.com:8884/mqtt
VITE_MQTT_USERNAME=
VITE_MQTT_PASSWORD=

# Application Configuration
VITE_APP_NAME=${appName}
VITE_APP_TYPE=${intent.appType}
VITE_APP_INDUSTRY=${intent.industry}
`;
  fs.writeFileSync(envPath, envContent.trim());

  // Create README
  const readmePath = path.join(appPath, 'README.md');
  const readmeContent = `# ${appName}

## Description
${intent.appType} application for ${intent.industry} industry.

## Features
${intent.functions.map((f: string) => `- ${f}`).join('\n')}

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Configure MQTT broker (edit .env file)
# VITE_MQTT_BROKER_URL=your_broker_url

# Start development server
npm run dev
\`\`\`

## Modules
${modules.modules.map((m: any) => `- **${m.name}**: ${m.description}`).join('\n')}

## Generated
- Date: ${new Date().toISOString()}
- UUID: ${uuid}
- UNS Source: ${unsPath}
`;
  fs.writeFileSync(readmePath, readmeContent);

  const appInfo: AppInfo = {
    name: appName,
    path: appPath,
    uuid,
    createdAt: new Date().toISOString()
  };

  // Run post-processing validation
  await validateGeneratedApp(appPath);

  console.log('\n✅ Application generated successfully!');
  console.log(`📁 Location: ${appPath}`);

  return appInfo;
}

async function validateGeneratedApp(appPath: string) {
  console.log('\n🔍 Validating generated application...');

  const validationErrors: string[] = [];

  // Check for required files
  const requiredFiles = [
    'package.json',
    'src/App.tsx',
    'src/main.tsx',
    'src/router.tsx',
    'src/pages/MainPage.tsx',
    'src/components/features/ConnectionPanel.tsx',
    'src/mqtt/MQTTProvider.tsx'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(appPath, file);
    if (!fs.existsSync(filePath)) {
      validationErrors.push(`Missing required file: ${file}`);
    }
  }

  // Fix common issues automatically
  const mainTsxPath = path.join(appPath, 'src/main.tsx');
  if (fs.existsSync(mainTsxPath)) {
    let mainContent = fs.readFileSync(mainTsxPath, 'utf-8');

    // Ensure main.tsx imports RouterProvider correctly
    if (!mainContent.includes('RouterProvider')) {
      mainContent = mainContent.replace(
        "import './index.css';",
        `import './index.css';
import { RouterProvider } from 'react-router-dom';`
      );
    }

    // Ensure MQTTProvider is imported
    if (!mainContent.includes('MQTTProvider')) {
      mainContent = mainContent.replace(
        "import './index.css';",
        `import './index.css';
import { MQTTProvider } from '@/mqtt/MQTTProvider';`
      );
    }

    fs.writeFileSync(mainTsxPath, mainContent);
  }

  // Ensure mock data is available in components
  const componentsDir = path.join(appPath, 'src/components/modules');
  if (fs.existsSync(componentsDir)) {
    const componentFiles = fs.readdirSync(componentsDir);
    for (const file of componentFiles) {
      if (file.endsWith('.tsx')) {
        const filePath = path.join(componentsDir, file);
        let content = fs.readFileSync(filePath, 'utf-8');

        // Ensure getMockData is defined
        if (!content.includes('getMockData')) {
          const mockDataFunction = `
// Mock data generator
function getMockData(moduleId: string): any[] {
  const mockDataMap: Record<string, any[]> = {
    'realtime-monitoring': [
      { device: 'CH01', status: 'running', value: 95 },
      { device: 'CH02', status: 'idle', value: 0 },
      { device: 'TR01', status: 'running', value: 78 }
    ],
    'inventory-management': [
      { item: 'Steel Sheet S1', current: 750, max: 1000 },
      { item: 'Steel Sheet S2', current: 450, max: 1000 },
      { item: 'Steel Sheet S3', current: 85, max: 1000 }
    ],
    'production-tracking': [
      { job: 'JOB-5234', progress: 65, status: 'in_progress' },
      { job: 'JOB-5235', progress: 100, status: 'completed' },
      { job: 'JOB-5236', progress: 0, status: 'pending' }
    ],
    'order-management': [
      { orderId: 'ORD-001', customer: 'CUST-123', status: 'in_progress' },
      { orderId: 'ORD-002', customer: 'CUST-456', status: 'completed' },
      { orderId: 'ORD-003', customer: 'CUST-789', status: 'pending' }
    ]
  };
  return mockDataMap[moduleId] || [];
}

`;
          content = content.replace(
            "import { useMQTT } from '../../mqtt/MQTTProvider';",
            `import { useMQTT } from '../../mqtt/MQTTProvider';
${mockDataFunction}`
          );
          fs.writeFileSync(filePath, content);
        }
      }
    }
  }

  if (validationErrors.length > 0) {
    console.warn('\n⚠️  Validation warnings:');
    validationErrors.forEach(error => console.warn(`  - ${error}`));
  } else {
    console.log('✅ Validation passed');
  }
}

async function generateMQTTConfig(appPath: string, unsPath: string) {
  const unsData = JSON.parse(fs.readFileSync(unsPath, 'utf-8'));

  // Extract subscription topics
  const subscriptionTopics = unsData.topics
    ?.filter((t: any) => t.type === 'state' || t.type === 'metrics')
    .map((t: any) => t.path) || [];

  // Create MQTT configuration
  const mqttConfigPath = path.join(appPath, 'src/config/mqtt.ts');
  const mqttConfig = `// Auto-generated MQTT Configuration
export const mqttConfig = {
  // Topics to subscribe
  subscriptionTopics: ${JSON.stringify(subscriptionTopics, null, 2)},

  // Connection options
  options: {
    clientId: \`factory-dashboard-\${Math.random().toString(36).substring(7)}\`,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
  }
};
`;

  fs.ensureDirSync(path.dirname(mqttConfigPath));
  fs.writeFileSync(mqttConfigPath, mqttConfig);
}

async function generateComponents(appPath: string, modules: any, design: any) {
  const componentsPath = path.join(appPath, 'src/components/modules');
  fs.ensureDirSync(componentsPath);

  // Generate a component for each module
  for (const module of modules.modules) {
    if (module.id === 'mqtt-connection') continue; // Skip infrastructure module

    const componentPath = path.join(componentsPath, `${toPascalCase(module.id)}.tsx`);
    const componentContent = generateModuleComponent(module, design);
    fs.writeFileSync(componentPath, componentContent);
  }
}

function generateModuleComponent(module: any, design: any): string {
  return `import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useMQTT } from '../../mqtt/MQTTProvider';
import { ${getModuleIcon(module.id)} } from 'lucide-react';

// Mock data generator
function getMockData(moduleId: string): any[] {
  const mockDataMap: Record<string, any[]> = {
    'realtime-monitoring': [
      { device: 'CH01', status: 'running', value: 95 },
      { device: 'CH02', status: 'idle', value: 0 },
      { device: 'TR01', status: 'running', value: 78 }
    ],
    'inventory-management': [
      { item: 'Steel Sheet S1', current: 750, max: 1000 },
      { item: 'Steel Sheet S2', current: 450, max: 1000 },
      { item: 'Steel Sheet S3', current: 85, max: 1000 }
    ],
    'production-tracking': [
      { job: 'JOB-5234', progress: 65, status: 'in_progress' },
      { job: 'JOB-5235', progress: 100, status: 'completed' },
      { job: 'JOB-5236', progress: 0, status: 'pending' }
    ],
    'order-management': [
      { orderId: 'ORD-001', customer: 'CUST-123', status: 'in_progress' },
      { orderId: 'ORD-002', customer: 'CUST-456', status: 'completed' },
      { orderId: 'ORD-003', customer: 'CUST-789', status: 'pending' }
    ]
  };
  return mockDataMap[moduleId] || [];
}

interface ${toPascalCase(module.id)}Props {
  className?: string;
}

export const ${toPascalCase(module.id)}: React.FC<${toPascalCase(module.id)}Props> = ({ className }) => {
  const { state, subscribe } = useMQTT();
  const [data, setData] = useState<any[]>(getMockData('${module.id}'));
  const isConnected = state.status === 'connected';

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribes: (() => void)[] = [];

    // Subscribe to module topics
    ${JSON.stringify(module.mqttTopics.slice(0, 5))}.forEach(topic => {
      const unsub = subscribe(topic, (payload) => {
        console.log('${module.name} received:', topic, payload);
        setData(prev => [...prev.slice(-9), { topic, payload, timestamp: Date.now() }]);
      });
      unsubscribes.push(unsub);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [isConnected, subscribe]);

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <${getModuleIcon(module.id)} className="h-5 w-5" />
            ${module.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Waiting for MQTT connection...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <${getModuleIcon(module.id)} className="h-5 w-5" />
            ${module.name}
          </span>
          <Badge variant="outline">{data.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">${module.description}</p>

        {/* Add module-specific UI here based on module type */}
        <div className="space-y-2">
          {data.slice(-5).map((item, idx) => (
            <div key={idx} className="p-2 bg-secondary rounded text-sm">
              <span className="font-mono">{item.topic}</span>
              <pre className="text-xs mt-1">{JSON.stringify(item.payload, null, 2)}</pre>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ${toPascalCase(module.id)};
`;
}

async function generateMainApp(appPath: string, modules: any, design: any, intent: any) {
  // Generate router.tsx
  const routerContent = `import { createBrowserRouter } from 'react-router-dom';
import { MainPage } from './pages/MainPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
]);
`;

  const routerPath = path.join(appPath, 'src/router.tsx');
  fs.writeFileSync(routerPath, routerContent);

  // Generate MainPage.tsx
  const mainPageContent = `import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ConnectionPanel } from '../components/features/ConnectionPanel';
import { Badge } from '../components/ui/badge';
import { Factory, Activity, Settings } from 'lucide-react';
${modules.modules
  .filter((m: any) => m.id !== 'mqtt-connection')
  .map((m: any) => `import ${toPascalCase(m.id)} from '../components/modules/${toPascalCase(m.id)}';`)
  .join('\n')}

export const MainPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ${intent.appType} Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring and control system for ${intent.industry} operations
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Connection
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            ${generateDashboardLayout(modules)}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <ConnectionPanel />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};
`;

  const mainPagePath = path.join(appPath, 'src/pages/MainPage.tsx');
  fs.ensureDirSync(path.dirname(mainPagePath));
  fs.writeFileSync(mainPagePath, mainPageContent);

  // Generate ConnectionPanel.tsx
  const connectionPanelContent = `import React, { useState } from 'react';
import { Play, X, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useMQTT } from '../../mqtt/MQTTProvider';

export const ConnectionPanel: React.FC = () => {
  const { state, connect, end } = useMQTT();
  const [url, setUrl] = useState('wss://broker.emqx.io:8084/mqtt');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    if (state.status === 'connected') {
      end();
    } else {
      setIsConnecting(true);
      connect({ url, clientIdPrefix: '${intent.appType.toLowerCase().replace(/\s+/g, '-')}' });
      setTimeout(() => setIsConnecting(false), 1000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Wifi className="w-5 h-5" />
          MQTT Connection Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Broker URL</label>
            <Input
              placeholder="wss://broker.example:8083/mqtt"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
            />
          </div>
          <div className="pt-7">
            <Button
              onClick={handleConnect}
              disabled={!url && state.status !== 'connected'}
              variant={state.status === 'connected' ? 'secondary' : 'default'}
              className="min-w-[120px]"
            >
              {isConnecting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : state.status === 'connected' ? (
                <>
                  <X className="w-4 h-4 mr-1" />
                  Disconnect
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Connect
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          {state.status === 'connected' ? (
            <Badge variant="default" className="bg-green-500">
              <Wifi className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          ) : state.status === 'connecting' ? (
            <Badge variant="secondary">
              Connecting...
            </Badge>
          ) : (
            <Badge variant="outline">
              <WifiOff className="w-3 h-3 mr-1" />
              Disconnected
            </Badge>
          )}
        </div>

        {state.error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
            Error: {state.error}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>Default broker: wss://broker.emqx.io:8084/mqtt</p>
          <p>This is a public test broker. For production, use your own MQTT broker.</p>
        </div>
      </CardContent>
    </Card>
  );
};
`;

  const connectionPanelPath = path.join(appPath, 'src/components/features/ConnectionPanel.tsx');
  fs.ensureDirSync(path.dirname(connectionPanelPath));
  fs.writeFileSync(connectionPanelPath, connectionPanelContent);

  // Keep a minimal App.tsx for compatibility
  const appContent = `import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { MQTTProvider } from './mqtt/MQTTProvider';
import { router } from './router';

function App() {
  return (
    <MQTTProvider>
      <RouterProvider router={router} />
    </MQTTProvider>
  );
}

export default App;
`;

  const appPath_file = path.join(appPath, 'src/App.tsx');
  fs.writeFileSync(appPath_file, appContent);
}

function generateTabsLayout(modules: any): string {
  const tabs = modules.modules
    .filter((m: any) => m.id !== 'mqtt-connection')
    .map((m: any) => ({
      id: m.id,
      label: m.name,
      component: toPascalCase(m.id)
    }));

  return `
          <Tabs defaultValue="${tabs[0]?.id}" className="w-full">
            <TabsList className="grid w-full grid-cols-${Math.min(tabs.length, 6)}">
              ${tabs.map((t: any) => `
              <TabsTrigger value="${t.id}">${t.label}</TabsTrigger>`).join('')}
            </TabsList>
            ${tabs.map((t: any) => `
            <TabsContent value="${t.id}" className="space-y-4">
              <${t.component} />
            </TabsContent>`).join('')}
          </Tabs>`;
}

function generateDashboardLayout(modules: any): string {
  const components = modules.modules
    .filter((m: any) => m.id !== 'mqtt-connection')
    .map((m: any) => toPascalCase(m.id));

  return `
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              ${components.slice(0, 2).map((c: string) => `<${c} />`).join('\n              ')}
            </div>
            ${components.length > 2 ? `
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              ${components.slice(2, 4).map((c: string) => `<${c} />`).join('\n              ')}
            </div>` : ''}
            ${components.length > 4 ? `
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              ${components.slice(4).map((c: string) => `<${c} />`).join('\n              ')}
            </div>` : ''}`;
}

function generateGridLayout(modules: any): string {
  const components = modules.modules
    .filter((m: any) => m.id !== 'mqtt-connection')
    .map((m: any) => toPascalCase(m.id));

  return `
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            ${components.map((c: string) => `<${c} />`).join('\n            ')}
          </div>`;
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
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