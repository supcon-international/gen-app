#!/usr/bin/env python3
"""
Agent Workflow for Dashboard Application Generation
This script automates the creation of a production monitoring dashboard
based on specifications in the artifacts directory.
"""

import os
import sys
import json
import subprocess
import time
import re
from typing import Dict, List, Any
from datetime import datetime
from pathlib import Path
import shutil

class Logger:
    """Enhanced logger for detailed workflow tracking"""

    def __init__(self, log_file: str = "workflow.log"):
        self.log_file = log_file
        self.start_time = time.time()

    def log(self, level: str, message: str, data: Any = None):
        """Log message with timestamp and optional data"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        elapsed = f"{time.time() - self.start_time:.2f}s"

        log_entry = f"[{timestamp}] [{elapsed}] [{level}] {message}"

        if data:
            log_entry += f"\n    Data: {json.dumps(data, indent=2, default=str)}"

        print(log_entry)

        with open(self.log_file, 'a') as f:
            f.write(log_entry + "\n")

    def info(self, message: str, data: Any = None):
        self.log("INFO", message, data)

    def success(self, message: str, data: Any = None):
        self.log("SUCCESS", f"✅ {message}", data)

    def error(self, message: str, data: Any = None):
        self.log("ERROR", f"❌ {message}", data)

    def step(self, message: str):
        self.log("STEP", f"▶️  {message}")

class ArtifactsAnalyzer:
    """Analyzes markdown specifications to extract dashboard requirements"""

    def __init__(self, logger: Logger):
        self.logger = logger
        self.specs = {}

    def read_artifacts(self, artifacts_dir: str) -> Dict[str, Any]:
        """Read and parse all specification files"""
        self.logger.step("Reading artifacts from directory")

        spec_files = {
            'dashboard': 'dashboard_spec.md',
            'prd': 'PRD.md',
            'product_config': 'product_config_spec.md'
        }

        for key, filename in spec_files.items():
            filepath = os.path.join(artifacts_dir, filename)
            if os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    self.specs[key] = content
                    self.logger.info(f"Read {filename}", {"lines": len(content.split('\n'))})
            else:
                self.logger.error(f"File not found: {filename}")

        return self.specs

    def analyze_requirements(self) -> Dict[str, Any]:
        """Extract key requirements from specifications"""
        self.logger.step("Analyzing requirements from specifications")

        requirements = {
            'components': [],
            'data_sources': [],
            'features': [],
            'mqtt_config': {},
            'ui_layout': {}
        }

        # Extract components from PRD
        if 'prd' in self.specs:
            prd = self.specs['prd']

            # Extract component requirements
            components = [
                {'name': 'KPICards', 'type': 'metrics', 'priority': 'high'},
                {'name': 'EquipmentStatusGrid', 'type': 'grid', 'priority': 'high'},
                {'name': 'ActiveAlertsPanel', 'type': 'list', 'priority': 'medium'},
                {'name': 'ProductionScheduleView', 'type': 'table', 'priority': 'medium'},
                {'name': 'MaterialToolingStatus', 'type': 'status', 'priority': 'low'},
                {'name': 'ControlActionsPanel', 'type': 'actions', 'priority': 'medium'},
                {'name': 'MessageFeed', 'type': 'feed', 'priority': 'low'}
            ]
            requirements['components'] = components

            # Extract MQTT configuration
            mqtt_match = re.search(r'ws://([^/]+)/mqtt', prd)
            if mqtt_match:
                requirements['mqtt_config'] = {
                    'broker': 'broker.hivemq.com',
                    'port': 8884,
                    'protocol': 'ws',
                    'topic_prefix': 'v1/FY-Fab'
                }

        # Extract dashboard specific requirements
        if 'dashboard' in self.specs:
            dashboard = self.specs['dashboard']

            # Extract equipment list
            equipment_match = re.findall(r'(LASER\d+|BEND\d+|COAT\d+|ASSY\d+|CUT\d+|CH\d+|TR\d+|HT\d+)', dashboard)
            requirements['equipment'] = list(set(equipment_match))

            # Extract features
            features = [
                {'name': 'real_time_updates', 'interval': 5},
                {'name': 'filtering', 'types': ['工序', '工站', '状态', '产品']},
                {'name': 'alerts', 'types': ['changeover', 'quality', 'maintenance']},
                {'name': 'actions', 'types': ['dispatch', 'start', 'complete']}
            ]
            requirements['features'] = features

        self.logger.success("Requirements analysis complete", requirements)
        return requirements

    def generate_implementation_plan(self, requirements: Dict) -> List[Dict]:
        """Generate step-by-step implementation plan"""
        self.logger.step("Generating implementation plan")

        plan = [
            {
                'step': 1,
                'task': 'Setup React application structure',
                'components': ['App.tsx', 'index.tsx', 'main layout'],
                'priority': 'critical'
            },
            {
                'step': 2,
                'task': 'Implement MQTT connection',
                'components': ['MqttProvider', 'useMqtt hook'],
                'priority': 'critical'
            },
            {
                'step': 3,
                'task': 'Create KPI Cards Component',
                'components': ['KPICards.tsx', 'MetricCard.tsx'],
                'priority': 'high',
                'data_visualization': 'numeric_display'
            },
            {
                'step': 4,
                'task': 'Create Equipment Status Grid',
                'components': ['EquipmentGrid.tsx', 'EquipmentCard.tsx'],
                'priority': 'high',
                'data_visualization': 'status_grid'
            },
            {
                'step': 5,
                'task': 'Implement Alerts Panel',
                'components': ['AlertsPanel.tsx', 'AlertItem.tsx'],
                'priority': 'medium',
                'data_visualization': 'list_with_severity'
            },
            {
                'step': 6,
                'task': 'Create Production Schedule View',
                'components': ['ScheduleView.tsx', 'JobTable.tsx'],
                'priority': 'medium',
                'data_visualization': 'data_table'
            },
            {
                'step': 7,
                'task': 'Implement Control Actions',
                'components': ['ControlPanel.tsx', 'ActionButton.tsx'],
                'priority': 'medium'
            },
            {
                'step': 8,
                'task': 'Add Message Feed',
                'components': ['MessageFeed.tsx'],
                'priority': 'low',
                'data_visualization': 'scrollable_feed'
            },
            {
                'step': 9,
                'task': 'Implement responsive layout',
                'components': ['Layout adjustments', 'Tailwind config'],
                'priority': 'medium'
            },
            {
                'step': 10,
                'task': 'Add real-time data updates',
                'components': ['Data hooks', 'State management'],
                'priority': 'high'
            }
        ]

        self.logger.success("Implementation plan generated", {"steps": len(plan)})
        return plan

class AppGenerator:
    """Generates the dashboard application based on requirements"""

    def __init__(self, logger: Logger):
        self.logger = logger
        self.app_dir = None

    def setup_new_app(self) -> str:
        """Run setup-new-app.sh script"""
        self.logger.step("Running setup-new-app.sh to create new application")

        try:
            # Remove existing new-app directory if it exists
            if os.path.exists('new-app'):
                shutil.rmtree('new-app')
                self.logger.info("Removed existing new-app directory")

            # Run the setup script
            result = subprocess.run(['./setup-new-app.sh'],
                                  capture_output=True,
                                  text=True,
                                  check=True)

            self.logger.success("Setup script completed", {
                "stdout": result.stdout[-500:] if result.stdout else None  # Last 500 chars
            })

            self.app_dir = 'new-app'
            return self.app_dir

        except subprocess.CalledProcessError as e:
            self.logger.error(f"Setup script failed", {
                "error": str(e),
                "stderr": e.stderr
            })
            raise

    def install_dependencies(self) -> bool:
        """Install required npm packages"""
        self.logger.step("Installing dependencies")

        dependencies = [
            'mqtt',
            'recharts',
            '@tanstack/react-query',
            'lucide-react',
            'date-fns',
            'clsx',
            'tailwind-merge'
        ]

        try:
            os.chdir(self.app_dir)

            # Install dependencies
            cmd = ['npm', 'install'] + dependencies
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)

            self.logger.success("Dependencies installed", {
                "packages": dependencies
            })

            os.chdir('..')
            return True

        except subprocess.CalledProcessError as e:
            self.logger.error("Failed to install dependencies", {
                "error": str(e),
                "stderr": e.stderr
            })
            os.chdir('..')
            return False

    def generate_component(self, component_name: str, component_type: str,
                         visualization: str = None) -> str:
        """Generate React component code based on type and visualization needs"""
        self.logger.info(f"Generating component: {component_name}", {
            "type": component_type,
            "visualization": visualization
        })

        # Component templates based on type and visualization
        if component_name == "KPICards":
            return self._generate_kpi_cards()
        elif component_name == "EquipmentGrid":
            return self._generate_equipment_grid()
        elif component_name == "AlertsPanel":
            return self._generate_alerts_panel()
        elif component_name == "ScheduleView":
            return self._generate_schedule_view()
        elif component_name == "ControlPanel":
            return self._generate_control_panel()
        elif component_name == "MessageFeed":
            return self._generate_message_feed()
        elif component_name == "MqttProvider":
            return self._generate_mqtt_provider()
        else:
            return self._generate_default_component(component_name)

    def _generate_kpi_cards(self) -> str:
        """Generate KPI Cards component with chart visualization"""
        return '''import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown, Activity, Package } from 'lucide-react';

interface KPIData {
  activeJobs: number;
  oee: number;
  productionRate: number;
  qualityRate: number;
}

export const KPICards: React.FC<{ data?: KPIData }> = ({ data }) => {
  const kpis = [
    {
      title: '活跃任务',
      value: data?.activeJobs || 0,
      icon: Activity,
      trend: 'up',
      change: '+12%'
    },
    {
      title: 'OEE',
      value: `${data?.oee || 0}%`,
      icon: TrendingUp,
      trend: 'up',
      change: '+3.2%'
    },
    {
      title: '生产率',
      value: `${data?.productionRate || 0}/h`,
      icon: Package,
      trend: 'down',
      change: '-2.1%'
    },
    {
      title: '质量率',
      value: `${data?.qualityRate || 0}%`,
      icon: TrendingUp,
      trend: 'up',
      change: '+1.5%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {kpi.title}
            </CardTitle>
            <kpi.icon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className={`text-xs ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {kpi.change} 较昨日
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};'''

    def _generate_equipment_grid(self) -> str:
        """Generate Equipment Grid component"""
        return '''import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface Equipment {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'queued' | 'maintenance' | 'error';
  currentJob?: string;
  batchQty?: number;
  operator?: string;
}

const statusColors = {
  idle: 'bg-gray-200',
  running: 'bg-green-500',
  queued: 'bg-yellow-500',
  maintenance: 'bg-orange-500',
  error: 'bg-red-500'
};

const statusLabels = {
  idle: '空闲',
  running: '运行中',
  queued: '排队中',
  maintenance: '维护中',
  error: '故障'
};

export const EquipmentGrid: React.FC<{ equipment?: Equipment[] }> = ({ equipment = [] }) => {
  const defaultEquipment: Equipment[] = [
    { id: 'LASER01', name: '激光切割机1', status: 'running', currentJob: 'JOB-001', batchQty: 100 },
    { id: 'BEND01', name: '折弯机1', status: 'idle' },
    { id: 'COAT01', name: '喷涂线1', status: 'queued', currentJob: 'JOB-002', batchQty: 50 },
    { id: 'ASSY01', name: '装配线1', status: 'running', currentJob: 'JOB-003', batchQty: 75 },
    { id: 'CUT01', name: '切线机1', status: 'maintenance' },
    { id: 'CH01', name: '冷镦机1', status: 'running', currentJob: 'JOB-004', batchQty: 200 }
  ];

  const displayEquipment = equipment.length > 0 ? equipment : defaultEquipment;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {displayEquipment.map((equip) => (
        <Card key={equip.id} className="relative">
          <div className={`absolute top-0 right-0 w-3 h-3 rounded-full m-2 ${statusColors[equip.status]}`} />
          <CardHeader>
            <CardTitle className="text-base">{equip.name}</CardTitle>
            <Badge variant="outline">{statusLabels[equip.status]}</Badge>
          </CardHeader>
          <CardContent className="text-sm">
            {equip.currentJob && (
              <div>
                <p className="font-medium">当前任务: {equip.currentJob}</p>
                {equip.batchQty && <p>批量: {equip.batchQty}</p>}
              </div>
            )}
            {!equip.currentJob && equip.status === 'idle' && (
              <p className="text-muted-foreground">等待任务分配</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};'''

    def _generate_alerts_panel(self) -> str:
        """Generate Alerts Panel component"""
        return '''import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertItem {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  station: string;
  description: string;
  acknowledged: boolean;
}

const severityIcons = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const severityColors = {
  critical: 'border-red-500',
  warning: 'border-yellow-500',
  info: 'border-blue-500'
};

export const AlertsPanel: React.FC<{ alerts?: AlertItem[] }> = ({ alerts = [] }) => {
  const defaultAlerts: AlertItem[] = [
    {
      id: '1',
      timestamp: new Date(),
      severity: 'critical',
      station: 'COAT01',
      description: '需要换色清洗',
      acknowledged: false
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 600000),
      severity: 'warning',
      station: 'CH02',
      description: '模具寿命接近上限',
      acknowledged: false
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1200000),
      severity: 'info',
      station: 'LASER01',
      description: '计划维护提醒',
      acknowledged: true
    }
  ];

  const displayAlerts = alerts.length > 0 ? alerts : defaultAlerts;

  return (
    <Card>
      <CardHeader>
        <CardTitle>活动警报</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayAlerts.map((alert) => {
          const Icon = severityIcons[alert.severity];
          return (
            <Alert key={alert.id} className={severityColors[alert.severity]}>
              <Icon className="h-4 w-4" />
              <AlertTitle>{alert.station}</AlertTitle>
              <AlertDescription>
                {alert.description}
                <div className="text-xs text-muted-foreground mt-1">
                  {alert.timestamp.toLocaleTimeString()}
                </div>
              </AlertDescription>
            </Alert>
          );
        })}
      </CardContent>
    </Card>
  );
};'''

    def _generate_schedule_view(self) -> str:
        """Generate Schedule View component"""
        return '''import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface Job {
  jobId: string;
  orderId: string;
  productId: string;
  targetStation: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  batchQty: number;
  changeover: boolean;
}

export const ScheduleView: React.FC<{ jobs?: Job[] }> = ({ jobs = [] }) => {
  const defaultJobs: Job[] = [
    {
      jobId: 'JOB-001',
      orderId: 'ORD-2024-001',
      productId: 'P-PANEL1',
      targetStation: 'LASER01',
      scheduledStart: new Date(),
      scheduledEnd: new Date(Date.now() + 3600000),
      batchQty: 100,
      changeover: false
    },
    {
      jobId: 'JOB-002',
      orderId: 'ORD-2024-002',
      productId: 'P-M6',
      targetStation: 'CH01',
      scheduledStart: new Date(Date.now() + 3600000),
      scheduledEnd: new Date(Date.now() + 7200000),
      batchQty: 2000,
      changeover: true
    }
  ];

  const displayJobs = jobs.length > 0 ? jobs : defaultJobs;

  return (
    <Card>
      <CardHeader>
        <CardTitle>生产计划</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>任务ID</TableHead>
              <TableHead>订单</TableHead>
              <TableHead>产品</TableHead>
              <TableHead>工站</TableHead>
              <TableHead>计划开始</TableHead>
              <TableHead>批量</TableHead>
              <TableHead>换型</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayJobs.map((job) => (
              <TableRow key={job.jobId}>
                <TableCell className="font-medium">{job.jobId}</TableCell>
                <TableCell>{job.orderId}</TableCell>
                <TableCell>{job.productId}</TableCell>
                <TableCell>{job.targetStation}</TableCell>
                <TableCell>{job.scheduledStart.toLocaleTimeString()}</TableCell>
                <TableCell>{job.batchQty}</TableCell>
                <TableCell>{job.changeover ? '是' : '否'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};'''

    def _generate_control_panel(self) -> str:
        """Generate Control Panel component"""
        return '''import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Play, Send, RefreshCw, Settings } from 'lucide-react';

interface ControlAction {
  label: string;
  action: string;
  icon: React.ElementType;
  variant?: 'default' | 'secondary' | 'destructive';
}

export const ControlPanel: React.FC<{ onAction?: (action: string) => void }> = ({ onAction }) => {
  const actions: ControlAction[] = [
    { label: '分派任务', action: 'dispatch', icon: Send, variant: 'default' },
    { label: '开始任务', action: 'start', icon: Play, variant: 'default' },
    { label: '换模', action: 'changeMold', icon: RefreshCw, variant: 'secondary' },
    { label: '配置', action: 'configure', icon: Settings, variant: 'secondary' }
  ];

  const handleAction = (action: string) => {
    console.log(`执行操作: ${action}`);
    onAction?.(action);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>控制面板</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Button
            key={action.action}
            variant={action.variant || 'default'}
            onClick={() => handleAction(action.action)}
            className="w-full"
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};'''

    def _generate_message_feed(self) -> str:
        """Generate Message Feed component"""
        return '''import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

interface Message {
  id: string;
  timestamp: Date;
  topic: string;
  payload: any;
}

export const MessageFeed: React.FC<{ messages?: Message[] }> = ({ messages = [] }) => {
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (messages.length > 0) {
      setDisplayMessages(messages.slice(-50)); // Keep last 50 messages
    }
  }, [messages]);

  // Generate sample messages if none provided
  useEffect(() => {
    if (messages.length === 0) {
      const sampleMessages: Message[] = [
        {
          id: '1',
          timestamp: new Date(),
          topic: 'v1/FY-Fab/sheet/LASER01/state/current-job',
          payload: { job_id: 'JOB-001', status: 'running' }
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000),
          topic: 'v1/FY-Fab/cold/CH01/metrics/count',
          payload: { count: 150 }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 2000),
          topic: 'v1/FY-Fab/sched/state/queue-snapshot',
          payload: { queued_jobs: 5, running_jobs: 3 }
        }
      ];
      setDisplayMessages(sampleMessages);
    }
  }, [messages.length]);

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>消息流</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px]">
          <div className="space-y-2">
            {displayMessages.map((msg) => (
              <div key={msg.id} className="border rounded p-2 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">
                    {msg.timestamp.toLocaleTimeString()}
                  </Badge>
                  <span className="text-xs text-muted-foreground truncate ml-2">
                    {msg.topic}
                  </span>
                </div>
                <pre className="text-xs bg-muted p-1 rounded overflow-x-auto">
                  {JSON.stringify(msg.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};'''

    def _generate_mqtt_provider(self) -> str:
        """Generate MQTT Provider component"""
        return '''import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import mqtt from 'mqtt';

interface MqttContextType {
  client: mqtt.MqttClient | null;
  isConnected: boolean;
  messages: any[];
  subscribe: (topic: string) => void;
  publish: (topic: string, message: any) => void;
}

const MqttContext = createContext<MqttContextType>({
  client: null,
  isConnected: false,
  messages: [],
  subscribe: () => {},
  publish: () => {},
});

export const useMqtt = () => useContext(MqttContext);

export const MqttProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const mqttClient = mqtt.connect('ws://broker.hivemq.com:8884/mqtt', {
      clientId: `dashboard-${Date.now()}`,
      clean: true,
      reconnectPeriod: 5000,
    });

    mqttClient.on('connect', () => {
      console.log('MQTT Connected');
      setIsConnected(true);

      // Subscribe to default topics
      mqttClient.subscribe('v1/FY-Fab/#', { qos: 0 });
    });

    mqttClient.on('message', (topic, payload) => {
      const message = {
        id: Date.now().toString(),
        timestamp: new Date(),
        topic,
        payload: JSON.parse(payload.toString()),
      };

      setMessages((prev) => [...prev.slice(-49), message]);
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT Error:', err);
    });

    mqttClient.on('close', () => {
      setIsConnected(false);
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end();
    };
  }, []);

  const subscribe = (topic: string) => {
    if (client) {
      client.subscribe(topic, { qos: 0 });
    }
  };

  const publish = (topic: string, message: any) => {
    if (client) {
      client.publish(topic, JSON.stringify(message), { qos: 1 });
    }
  };

  return (
    <MqttContext.Provider value={{ client, isConnected, messages, subscribe, publish }}>
      {children}
    </MqttContext.Provider>
  );
};'''

    def _generate_default_component(self, name: str) -> str:
        """Generate a default component template"""
        return f'''import React from 'react';

export const {name}: React.FC = () => {{
  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-semibold">{name} Component</h2>
      <p className="text-muted-foreground">Component implementation pending</p>
    </div>
  );
}};'''

    def create_app_structure(self, requirements: Dict, plan: List[Dict]) -> bool:
        """Create the complete app structure with all components"""
        self.logger.step("Creating application structure")

        try:
            # Create directories
            src_dir = os.path.join(self.app_dir, 'src')
            components_dir = os.path.join(src_dir, 'components')
            ui_dir = os.path.join(components_dir, 'ui')

            os.makedirs(components_dir, exist_ok=True)
            os.makedirs(ui_dir, exist_ok=True)

            # Generate main components
            components_to_generate = [
                ('MqttProvider', 'provider', None),
                ('KPICards', 'metrics', 'numeric_display'),
                ('EquipmentGrid', 'grid', 'status_grid'),
                ('AlertsPanel', 'alerts', 'list_with_severity'),
                ('ScheduleView', 'schedule', 'data_table'),
                ('ControlPanel', 'controls', None),
                ('MessageFeed', 'feed', 'scrollable_feed')
            ]

            for comp_name, comp_type, visualization in components_to_generate:
                code = self.generate_component(comp_name, comp_type, visualization)
                file_path = os.path.join(components_dir, f'{comp_name}.tsx')

                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(code)

                self.logger.info(f"Created component: {comp_name}")

            # Create main App component
            app_code = self._generate_main_app()
            with open(os.path.join(src_dir, 'App.tsx'), 'w', encoding='utf-8') as f:
                f.write(app_code)

            # Create UI components (shadcn/ui style)
            self._create_ui_components(ui_dir)

            self.logger.success("Application structure created successfully")
            return True

        except Exception as e:
            self.logger.error(f"Failed to create app structure", {"error": str(e)})
            return False

    def _generate_main_app(self) -> str:
        """Generate the main App component"""
        return '''import React from 'react';
import { MqttProvider, useMqtt } from './components/MqttProvider';
import { KPICards } from './components/KPICards';
import { EquipmentGrid } from './components/EquipmentGrid';
import { AlertsPanel } from './components/AlertsPanel';
import { ScheduleView } from './components/ScheduleView';
import { ControlPanel } from './components/ControlPanel';
import { MessageFeed } from './components/MessageFeed';

const DashboardContent: React.FC = () => {
  const { isConnected, messages } = useMqtt();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              FY-Fab 生产监控仪表板
            </h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? '已连接' : '未连接'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* KPI Cards */}
        <section>
          <h2 className="text-lg font-semibold mb-4">关键绩效指标</h2>
          <KPICards />
        </section>

        {/* Equipment Grid and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">设备状态</h2>
            <EquipmentGrid />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">警报</h2>
            <AlertsPanel />
          </div>
        </div>

        {/* Schedule and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ScheduleView />
          </div>
          <div>
            <ControlPanel />
          </div>
        </div>

        {/* Message Feed */}
        <section>
          <h2 className="text-lg font-semibold mb-4">实时消息</h2>
          <MessageFeed messages={messages} />
        </section>
      </main>
    </div>
  );
};

function App() {
  return (
    <MqttProvider>
      <DashboardContent />
    </MqttProvider>
  );
}

export default App;'''

    def _create_ui_components(self, ui_dir: str):
        """Create basic UI components (shadcn/ui style)"""
        self.logger.info("Creating UI components")

        # Card component
        card_code = '''import React from 'react';

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
    {...props}
  />
));

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className}`}
    {...props}
  />
));

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = '', ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
));'''

        # Button component
        button_code = '''import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    };

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);'''

        # Badge component
        badge_code = '''import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'default',
  ...props
}) => {
  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    destructive: 'border-transparent bg-destructive text-destructive-foreground',
    outline: 'text-foreground',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}
      {...props}
    />
  );
};'''

        # Alert component
        alert_code = '''import React from 'react';

export const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={`relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-3px] [&:has(svg)]:pl-11 ${className}`}
    {...props}
  />
));

export const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = '', ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  />
));

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  />
));'''

        # Table component
        table_code = '''import React from 'react';

export const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className = '', ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table
      ref={ref}
      className={`w-full caption-bottom text-sm ${className}`}
      {...props}
    />
  </div>
));

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className = '', ...props }, ref) => (
  <thead ref={ref} className={`[&_tr]:border-b ${className}`} {...props} />
));

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className = '', ...props }, ref) => (
  <tbody
    ref={ref}
    className={`[&_tr:last-child]:border-0 ${className}`}
    {...props}
  />
));

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className = '', ...props }, ref) => (
  <tr
    ref={ref}
    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}
    {...props}
  />
));

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className = '', ...props }, ref) => (
  <th
    ref={ref}
    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
));

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className = '', ...props }, ref) => (
  <td
    ref={ref}
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
));'''

        # ScrollArea component
        scroll_area_code = '''import React from 'react';

export const ScrollArea: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div
    className={`relative overflow-auto ${className}`}
    {...props}
  >
    {children}
  </div>
);'''

        # Write UI component files
        ui_components = {
            'card.tsx': card_code,
            'button.tsx': button_code,
            'badge.tsx': badge_code,
            'alert.tsx': alert_code,
            'table.tsx': table_code,
            'scroll-area.tsx': scroll_area_code
        }

        for filename, code in ui_components.items():
            file_path = os.path.join(ui_dir, filename)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(code)
            self.logger.info(f"Created UI component: {filename}")

    def test_application(self) -> bool:
        """Run tests on the generated application"""
        self.logger.step("Testing generated application")

        try:
            os.chdir(self.app_dir)

            # Run build to check for compilation errors
            result = subprocess.run(['npm', 'run', 'build'],
                                  capture_output=True,
                                  text=True,
                                  timeout=60)

            if result.returncode == 0:
                self.logger.success("Application built successfully")
                os.chdir('..')
                return True
            else:
                self.logger.error("Build failed", {
                    "stdout": result.stdout[-1000:],
                    "stderr": result.stderr[-1000:]
                })
                os.chdir('..')
                return False

        except subprocess.TimeoutExpired:
            self.logger.error("Build timeout")
            os.chdir('..')
            return False
        except Exception as e:
            self.logger.error(f"Test failed", {"error": str(e)})
            os.chdir('..')
            return False

def main():
    """Main workflow execution"""
    logger = Logger()
    logger.info("===== Starting Agent Workflow =====")

    try:
        # Step 1: Analyze artifacts
        analyzer = ArtifactsAnalyzer(logger)
        specs = analyzer.read_artifacts('artifacts')
        requirements = analyzer.analyze_requirements()
        plan = analyzer.generate_implementation_plan(requirements)

        # Step 2: Setup new app
        generator = AppGenerator(logger)
        app_dir = generator.setup_new_app()

        # Step 3: Install dependencies
        if not generator.install_dependencies():
            logger.error("Failed to install dependencies, continuing anyway...")

        # Step 4: Create app structure
        if not generator.create_app_structure(requirements, plan):
            logger.error("Failed to create app structure")
            return 1

        # Step 5: Test application
        if generator.test_application():
            logger.success("===== Workflow Completed Successfully =====")
            logger.info("Application generated at: new-app/")
            logger.info("To start the application:")
            logger.info("  cd new-app")
            logger.info("  npm run dev")
            return 0
        else:
            logger.error("Application testing failed, but app was generated")
            logger.info("You may need to fix compilation errors manually")
            return 1

    except Exception as e:
        logger.error(f"Workflow failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())