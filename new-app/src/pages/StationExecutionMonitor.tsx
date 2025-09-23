import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Activity, PlayCircle, PauseCircle, CheckCircle2, AlertTriangle,
  Package, Clock, Settings, Wrench, Layers, Users, AlertCircle,
  TrendingUp, TrendingDown, Minus, RefreshCw, Zap
} from 'lucide-react';

interface JobData {
  jobId: string;
  orderId: string;
  productId: string;
  productName?: string;
  stepCode: string;
  batchQty: number;
  goodQty?: number;
  status: 'queued' | 'running' | 'completed' | 'paused';
  startTime?: string;
  endTime?: string;
  expectedMinutes?: number;
  operatorGroup?: string;
  nextStation?: string;
  priority?: number;
}

interface StationState {
  stationId: string;
  stationType: 'LASER' | 'BEND' | 'COAT' | 'ASSY' | 'CUTWIRE' | 'COLD' | 'THREAD' | 'HT';
  currentJob?: JobData;
  queuedJobs: JobData[];
  runningJobs: JobData[];
  status: 'idle' | 'running' | 'setup' | 'maintenance' | 'error';
  cycleTime?: number;
  oee?: number;
  setupInfo?: {
    type: string;
    fromProduct?: string;
    toProduct?: string;
    expectedMinutes: number;
    startTime: string;
  };
}

interface MaterialInventory {
  materialId: string;
  name: string;
  type: 'sheet' | 'wire' | 'coating' | 'parts';
  spec: string;
  onhandKg: number;
  allocatedKg: number;
  minLevel?: number;
}

interface MoldStatus {
  moldId: string;
  type: string;
  compatibleProducts: string[];
  currentStation?: string;
  usageCount: number;
  maxUsage: number;
  lastMaintenance?: string;
}

interface PlanDraft {
  planId: string;
  genTs: string;
  jobs: Array<{
    jobId: string;
    orderId: string;
    productId: string;
    stepCode: string;
    targetStation: string;
    batchQty: number;
    estStartTs: string;
    estEndTs: string;
    needMold?: string;
    needChangeover?: string;
  }>;
}

const StationExecutionMonitor = () => {
  // 模拟 MQTT 连接状态
  const [isConnected, setIsConnected] = useState(false);
  const [stations, setStations] = useState<StationState[]>([]);
  const [materials, setMaterials] = useState<MaterialInventory[]>([]);
  const [molds, setMolds] = useState<MoldStatus[]>([]);
  const [planDrafts, setPlanDrafts] = useState<PlanDraft[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [selectedProcess, setSelectedProcess] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // MQTT 主题订阅日志
  const logMqttSubscription = useCallback(() => {
    console.log('[MQTT] Station Execution Monitor - Initializing subscriptions');
    const topics = [
      // 工站状态
      'v1/FY-Fab/sheet/+/state/current-job',
      'v1/FY-Fab/sheet/+/state/queue',
      'v1/FY-Fab/sheet/+/metrics/cycle-ms',
      'v1/FY-Fab/wire/+/state/current-job',
      'v1/FY-Fab/wire/+/state/queue',

      // 排程和计划
      'v1/FY-Fab/sched/state/plan-draft',
      'v1/FY-Fab/sched/state/queue-snapshot',

      // 物料和工装
      'v1/FY-Fab/warehouse/state/inventory-+',
      'v1/FY-Fab/tooling/state/mold-+',
      'v1/FY-Fab/tooling/state/changeover-matrix-+',

      // 产品主数据
      'v1/FY-Fab/plm/state/product-master-+',
      'v1/FY-Fab/erp/state/order-registry',

      // 人力配置
      'v1/FY-Fab/workforce/state/workgroup-+'
    ];

    topics.forEach(topic => {
      console.log(`[MQTT] ✅ Subscribing to: ${topic}`);
    });
    console.log(`[MQTT] Total ${topics.length} topics subscribed`);
  }, []);

  useEffect(() => {
    // 模拟 MQTT 连接
    console.log('[MQTT] Connecting to UNS broker: ws://broker.hivemq.com:8884/mqtt');
    setTimeout(() => {
      setIsConnected(true);
      console.log('[MQTT] ✅ Connected successfully');
      logMqttSubscription();
    }, 1000);

    // 初始化钣金产线工站数据
    const sheetStations: StationState[] = [
      {
        stationId: 'LASER01',
        stationType: 'LASER',
        status: 'running',
        currentJob: {
          jobId: 'JOB-LZ-001',
          orderId: 'PO-202507-1001',
          productId: 'P-PANEL1',
          productName: '钣金面板 A',
          stepCode: 'LASER',
          batchQty: 5,
          status: 'running',
          startTime: new Date(Date.now() - 15 * 60000).toISOString(),
          expectedMinutes: 10,
          operatorGroup: 'OP_LASER'
        },
        queuedJobs: [
          { jobId: 'JOB-LZ-002', orderId: 'PO-202507-1002', productId: 'P-PANEL2', stepCode: 'LASER', batchQty: 10, status: 'queued', priority: 1 },
          { jobId: 'JOB-LZ-003', orderId: 'PO-202507-1003', productId: 'P-PANEL1', stepCode: 'LASER', batchQty: 8, status: 'queued', priority: 2 }
        ],
        runningJobs: [],
        cycleTime: 4500,
        oee: 85
      },
      {
        stationId: 'BEND01',
        stationType: 'BEND',
        status: 'idle',
        queuedJobs: [
          { jobId: 'JOB-BD-001', orderId: 'PO-202507-1001', productId: 'P-PANEL1', stepCode: 'BEND', batchQty: 5, status: 'queued' }
        ],
        runningJobs: [],
        cycleTime: 3200,
        oee: 78
      },
      {
        stationId: 'COAT01',
        stationType: 'COAT',
        status: 'setup',
        queuedJobs: [],
        runningJobs: [],
        setupInfo: {
          type: 'clean',
          fromProduct: 'P-PANEL1-RED',
          toProduct: 'P-PANEL1-BLUE',
          expectedMinutes: 30,
          startTime: new Date(Date.now() - 10 * 60000).toISOString()
        },
        oee: 72
      },
      {
        stationId: 'ASSY01',
        stationType: 'ASSY',
        status: 'running',
        currentJob: {
          jobId: 'JOB-AS-001',
          orderId: 'PO-202507-1000',
          productId: 'P-PANEL1',
          productName: '钣金面板 A',
          stepCode: 'ASSY',
          batchQty: 5,
          goodQty: 3,
          status: 'running',
          startTime: new Date(Date.now() - 20 * 60000).toISOString(),
          expectedMinutes: 10,
          operatorGroup: 'OP_ASSY'
        },
        queuedJobs: [
          { jobId: 'JOB-AS-002', orderId: 'PO-202507-1001', productId: 'P-PANEL1', stepCode: 'ASSY', batchQty: 5, status: 'queued' }
        ],
        runningJobs: [],
        oee: 90
      },
      {
        stationId: 'ASSY02',
        stationType: 'ASSY',
        status: 'idle',
        queuedJobs: [
          { jobId: 'JOB-AS-003', orderId: 'PO-202507-1002', productId: 'P-PANEL2', stepCode: 'ASSY', batchQty: 10, status: 'queued' },
          { jobId: 'JOB-AS-004', orderId: 'PO-202507-1003', productId: 'P-PANEL2', stepCode: 'ASSY', batchQty: 8, status: 'queued' }
        ],
        runningJobs: [],
        oee: 88
      }
    ];

    // 初始化冷镦产线工站数据
    const wireStations: StationState[] = [
      {
        stationId: 'CUT01',
        stationType: 'CUTWIRE',
        status: 'running',
        currentJob: {
          jobId: 'JOB-CW-001',
          orderId: 'PO-202507-0001',
          productId: 'P-M6',
          productName: 'M6 螺丝',
          stepCode: 'CUTWIRE',
          batchQty: 2000,
          status: 'running',
          startTime: new Date(Date.now() - 30 * 60000).toISOString(),
          expectedMinutes: 33.3,
          operatorGroup: 'OP_CUT'
        },
        queuedJobs: [
          { jobId: 'JOB-CW-002', orderId: 'PO-202507-0002', productId: 'P-M5', stepCode: 'CUTWIRE', batchQty: 2000, status: 'queued' }
        ],
        runningJobs: [],
        oee: 92
      },
      {
        stationId: 'CH01',
        stationType: 'COLD',
        status: 'running',
        currentJob: {
          jobId: 'JOB-CH-001',
          orderId: 'PO-202507-0001',
          productId: 'P-M5',
          productName: 'M5 螺丝',
          stepCode: 'COLD',
          batchQty: 2000,
          status: 'running',
          startTime: new Date(Date.now() - 25 * 60000).toISOString(),
          expectedMinutes: 40,
          operatorGroup: 'OP_COLD'
        },
        queuedJobs: [],
        runningJobs: [],
        oee: 87
      },
      {
        stationId: 'CH02',
        stationType: 'COLD',
        status: 'setup',
        queuedJobs: [
          { jobId: 'JOB-CH-002', orderId: 'PO-202507-0001', productId: 'P-M6', stepCode: 'COLD', batchQty: 2000, status: 'queued' }
        ],
        runningJobs: [],
        setupInfo: {
          type: 'changeover',
          fromProduct: 'P-M8',
          toProduct: 'P-M6',
          expectedMinutes: 25,
          startTime: new Date(Date.now() - 5 * 60000).toISOString()
        },
        oee: 83
      },
      {
        stationId: 'TR01',
        stationType: 'THREAD',
        status: 'running',
        currentJob: {
          jobId: 'JOB-TR-001',
          orderId: 'PO-202507-0003',
          productId: 'P-M8',
          productName: 'M8 螺栓',
          stepCode: 'THREAD',
          batchQty: 5000,
          goodQty: 3200,
          status: 'running',
          startTime: new Date(Date.now() - 60 * 60000).toISOString(),
          expectedMinutes: 125,
          operatorGroup: 'OP_THREAD'
        },
        queuedJobs: [],
        runningJobs: [],
        oee: 89
      },
      {
        stationId: 'TR02',
        stationType: 'THREAD',
        status: 'idle',
        queuedJobs: [
          { jobId: 'JOB-TR-002', orderId: 'PO-202507-0001', productId: 'P-M6', stepCode: 'THREAD', batchQty: 2000, status: 'queued' }
        ],
        runningJobs: [],
        oee: 86
      },
      {
        stationId: 'HT01',
        stationType: 'HT',
        status: 'running',
        currentJob: {
          jobId: 'JOB-HT-001',
          orderId: 'PO-202507-0004',
          productId: 'P-FL6',
          productName: 'M6 法兰螺栓',
          stepCode: 'HT',
          batchQty: 5000,
          status: 'running',
          startTime: new Date(Date.now() - 120 * 60000).toISOString(),
          expectedMinutes: 416.7,
          operatorGroup: 'OP_HEAT'
        },
        queuedJobs: [
          { jobId: 'JOB-HT-002', orderId: 'PO-202507-0005', productId: 'P-M8', stepCode: 'HT', batchQty: 5000, status: 'queued' }
        ],
        runningJobs: [],
        oee: 94
      }
    ];

    setStations([...sheetStations, ...wireStations]);

    // 初始化物料库存数据
    setMaterials([
      { materialId: 'S1', name: '冷轧钢板', type: 'sheet', spec: '1.0mm', onhandKg: 3000, allocatedKg: 500, minLevel: 1000 },
      { materialId: 'S2', name: '镀锌钢板', type: 'sheet', spec: '1.0mm', onhandKg: 2000, allocatedKg: 300, minLevel: 800 },
      { materialId: 'S3', name: '不锈钢板', type: 'sheet', spec: '1.2mm', onhandKg: 1500, allocatedKg: 200, minLevel: 600 },
      { materialId: 'W1', name: '中碳钢丝', type: 'wire', spec: 'φ5.0mm', onhandKg: 5000, allocatedKg: 1000, minLevel: 2000 },
      { materialId: 'W2', name: '低碳钢丝', type: 'wire', spec: 'φ3.0mm', onhandKg: 4000, allocatedKg: 800, minLevel: 1500 },
      { materialId: 'W3', name: '不锈钢丝', type: 'wire', spec: 'φ4.0mm', onhandKg: 3000, allocatedKg: 500, minLevel: 1200 }
    ]);

    // 初始化模具状态数据
    setMolds([
      { moldId: 'MOLD_M5', type: 'cold_header', compatibleProducts: ['P-M5'], currentStation: 'CH01', usageCount: 45000, maxUsage: 100000 },
      { moldId: 'MOLD_M6', type: 'cold_header', compatibleProducts: ['P-M6'], currentStation: 'CH02', usageCount: 38000, maxUsage: 100000 },
      { moldId: 'MOLD_M8', type: 'cold_header', compatibleProducts: ['P-M8'], usageCount: 62000, maxUsage: 100000 },
      { moldId: 'MOLD_FLANGE_M6', type: 'cold_header', compatibleProducts: ['P-FL6'], usageCount: 28000, maxUsage: 80000 },
      { moldId: 'ROLL_STD', type: 'thread_roller', compatibleProducts: ['P-M5', 'P-M6', 'P-M8', 'P-FL6'], currentStation: 'TR01', usageCount: 125000, maxUsage: 200000 }
    ]);

    // 模拟接收 MQTT 消息
    const simulateMessages = () => {
      setTimeout(() => {
        console.log('[MQTT] 📨 Received: v1/FY-Fab/sheet/LASER01/state/current-job');
        console.log('[MQTT] Data:', { job_id: 'JOB-LZ-001', status: 'running', batch_qty: 5 });
      }, 2000);

      setTimeout(() => {
        console.log('[MQTT] 📨 Received: v1/FY-Fab/sched/state/queue-snapshot');
        console.log('[MQTT] Data:', { station_count: 11, queued_jobs: 18, running_jobs: 5 });
      }, 2500);

      setTimeout(() => {
        console.log('[MQTT] 📨 Received: v1/FY-Fab/warehouse/state/inventory-S1');
        console.log('[MQTT] Data:', { material_id: 'S1', onhand_kg: 2950, allocated_kg: 550 });
      }, 3000);

      setTimeout(() => {
        console.log('[MQTT] 📨 Received: v1/FY-Fab/tooling/state/mold-MOLD_M6');
        console.log('[MQTT] Data:', { mold_id: 'MOLD_M6', usage_count: 38100, status: 'in_use' });
      }, 3500);
    };

    simulateMessages();

    // 心跳日志
    const heartbeat = setInterval(() => {
      if (isConnected) {
        console.log('[MQTT] 💓 Station Monitor Heartbeat - Active Stations:', stations.filter(s => s.status === 'running').length);
      }
    }, 30000);

    return () => {
      console.log('[MQTT] 🔌 Station Execution Monitor - Disconnecting...');
      clearInterval(heartbeat);
    };
  }, [isConnected, logMqttSubscription]);

  // 派工操作
  const handleDispatch = (stationId: string, jobId: string) => {
    const topic = `v1/FY-Fab/sheet/${stationId}/action/dispatch-task`;
    console.log(`[MQTT] 📤 Publishing to: ${topic}`);
    console.log('[MQTT] Payload:', { job_id: jobId, timestamp: new Date().toISOString() });
    console.log('[MQTT] ✅ Dispatch command sent');
  };

  // 开始任务
  const handleStart = (stationId: string, jobId: string) => {
    const topic = `v1/FY-Fab/sheet/${stationId}/action/start-task`;
    console.log(`[MQTT] 📤 Publishing to: ${topic}`);
    console.log('[MQTT] Payload:', { job_id: jobId, operator_group: 'OP_LASER', expect_minutes: 30 });
    console.log('[MQTT] ✅ Start command sent');
  };

  // 完成任务
  const handleComplete = (stationId: string, jobId: string) => {
    const topic = `v1/FY-Fab/sheet/${stationId}/action/complete-task`;
    console.log(`[MQTT] 📤 Publishing to: ${topic}`);
    console.log('[MQTT] Payload:', { job_id: jobId, good_qty: 5, end_reason: 'normal' });
    console.log('[MQTT] ✅ Complete command sent');
  };

  // 换线操作
  const handleChangeover = (stationId: string, fromProduct: string, toProduct: string) => {
    const topic = `v1/FY-Fab/sheet/${stationId}/action/changeover-start`;
    console.log(`[MQTT] 📤 Publishing to: ${topic}`);
    console.log('[MQTT] Payload:', { from_product: fromProduct, to_product: toProduct, expect_minutes: 30 });
    console.log('[MQTT] ✅ Changeover command sent');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <PlayCircle className="h-4 w-4 text-green-500" />;
      case 'idle': return <PauseCircle className="h-4 w-4 text-gray-400" />;
      case 'setup': return <Settings className="h-4 w-4 text-yellow-500" />;
      case 'maintenance': return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-200';
      case 'idle': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'setup': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getOEEColor = (oee?: number) => {
    if (!oee) return 'text-gray-400';
    if (oee >= 85) return 'text-green-600';
    if (oee >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getInventoryStatus = (material: MaterialInventory) => {
    const availableKg = material.onhandKg - material.allocatedKg;
    const percentage = material.minLevel ? (availableKg / material.minLevel) * 100 : 100;

    if (percentage < 50) return { color: 'text-red-600', icon: <AlertCircle className="h-4 w-4" /> };
    if (percentage < 100) return { color: 'text-yellow-600', icon: <AlertTriangle className="h-4 w-4" /> };
    return { color: 'text-green-600', icon: <CheckCircle2 className="h-4 w-4" /> };
  };

  const getMoldLifePercentage = (mold: MoldStatus) => {
    return Math.round((1 - mold.usageCount / mold.maxUsage) * 100);
  };

  const filteredStations = stations.filter(station => {
    if (selectedProcess !== 'all' && station.stationType !== selectedProcess) return false;
    if (selectedStation !== 'all' && station.stationId !== selectedStation) return false;
    return true;
  });

  const totalStats = {
    totalStations: stations.length,
    runningStations: stations.filter(s => s.status === 'running').length,
    totalQueued: stations.reduce((sum, s) => sum + s.queuedJobs.length, 0),
    avgOEE: Math.round(stations.reduce((sum, s) => sum + (s.oee || 0), 0) / stations.length)
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 border-b px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Station Execution Monitor</h1>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'UNS Connected' : 'Disconnected'}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            {totalStats.runningStations}/{totalStats.totalStations} Running
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Layers className="h-3 w-3" />
            {totalStats.totalQueued} Queued
          </Badge>
          <Badge variant="outline" className={`gap-1 ${getOEEColor(totalStats.avgOEE)}`}>
            <TrendingUp className="h-3 w-3" />
            OEE {totalStats.avgOEE}%
          </Badge>
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleString()}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="stations" className="h-full">
          <div className="px-6 pt-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="stations">Stations</TabsTrigger>
                <TabsTrigger value="queue">Queue Management</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="molds">Molds & Tools</TabsTrigger>
                <TabsTrigger value="plan">Planning</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Select value={selectedProcess} onValueChange={setSelectedProcess}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Process" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Processes</SelectItem>
                    <SelectItem value="LASER">LASER</SelectItem>
                    <SelectItem value="BEND">BEND</SelectItem>
                    <SelectItem value="COAT">COAT</SelectItem>
                    <SelectItem value="ASSY">ASSY</SelectItem>
                    <SelectItem value="CUTWIRE">CUTWIRE</SelectItem>
                    <SelectItem value="COLD">COLD</SelectItem>
                    <SelectItem value="THREAD">THREAD</SelectItem>
                    <SelectItem value="HT">HT</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'table')}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid View</SelectItem>
                    <SelectItem value="table">Table View</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon" onClick={() => {
                  console.log('[MQTT] 🔄 Refreshing all station data...');
                  console.log('[MQTT] Requesting full state sync from UNS');
                }}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stations Tab */}
          <TabsContent value="stations" className="h-full p-6 overflow-auto">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-4 gap-4">
                {filteredStations.map(station => (
                  <Card key={station.stationId} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(station.status)}
                          <CardTitle className="text-sm">{station.stationId}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(station.status)}>
                          {station.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{station.stationType}</span>
                        <span className={getOEEColor(station.oee)}>OEE: {station.oee}%</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Current Job */}
                      {station.currentJob && (
                        <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">Current Job</span>
                            <Badge variant="outline" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Running
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs">
                              <span className="text-muted-foreground">Job ID: </span>
                              <span className="font-mono">{station.currentJob.jobId}</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-muted-foreground">Product: </span>
                              <span>{station.currentJob.productName || station.currentJob.productId}</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-muted-foreground">Batch: </span>
                              <span>{station.currentJob.goodQty || 0}/{station.currentJob.batchQty}</span>
                            </div>
                            {station.currentJob.expectedMinutes && (
                              <Progress
                                value={(Date.now() - new Date(station.currentJob.startTime!).getTime()) / (station.currentJob.expectedMinutes * 60000) * 100}
                                className="h-1 mt-2"
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Setup Info */}
                      {station.setupInfo && (
                        <Alert className="py-2">
                          <Settings className="h-3 w-3" />
                          <AlertDescription className="text-xs ml-2">
                            {station.setupInfo.type === 'clean' ? 'Cleaning' : 'Changeover'}:
                            {station.setupInfo.fromProduct && ` ${station.setupInfo.fromProduct} → ${station.setupInfo.toProduct}`}
                            <div className="mt-1">
                              Remaining: {Math.max(0, station.setupInfo.expectedMinutes -
                                Math.round((Date.now() - new Date(station.setupInfo.startTime).getTime()) / 60000))} min
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Queue Summary */}
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Queue:</span>
                        <span className="font-medium">{station.queuedJobs.length} jobs</span>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        {station.status === 'idle' && station.queuedJobs.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleStart(station.stationId, station.queuedJobs[0].jobId)}
                          >
                            <PlayCircle className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {station.status === 'running' && station.currentJob && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleComplete(station.stationId, station.currentJob!.jobId)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="text-xs">
                          <Settings className="h-3 w-3 mr-1" />
                          Setup
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Station</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Job</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Queue</TableHead>
                    <TableHead>OEE</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStations.map(station => (
                    <TableRow key={station.stationId}>
                      <TableCell className="font-medium">{station.stationId}</TableCell>
                      <TableCell>{station.stationType}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(station.status)}>
                          {station.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {station.currentJob?.jobId || '-'}
                      </TableCell>
                      <TableCell>
                        {station.currentJob?.productName || station.currentJob?.productId || '-'}
                      </TableCell>
                      <TableCell>
                        {station.currentJob ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{station.currentJob.goodQty || 0}/{station.currentJob.batchQty}</span>
                            <Progress value={(station.currentJob.goodQty || 0) / station.currentJob.batchQty * 100} className="w-20 h-1" />
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{station.queuedJobs.length}</TableCell>
                      <TableCell className={getOEEColor(station.oee)}>{station.oee}%</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {station.status === 'idle' && station.queuedJobs.length > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStart(station.stationId, station.queuedJobs[0].jobId)}
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {station.status === 'running' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleComplete(station.stationId, station.currentJob!.jobId)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Queue Management Tab */}
          <TabsContent value="queue" className="h-full p-6 overflow-auto">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Queue Overview</CardTitle>
                  <CardDescription>Manage job queues across all stations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {stations.filter(s => s.queuedJobs.length > 0).map(station => (
                        <div key={station.stationId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{station.stationId}</h3>
                              <Badge variant="outline">{station.queuedJobs.length} jobs</Badge>
                            </div>
                            <Button size="sm" variant="outline">Reorder</Button>
                          </div>
                          <div className="space-y-2">
                            {station.queuedJobs.map((job, idx) => (
                              <div key={job.jobId} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                <div className="flex items-center gap-4">
                                  <span className="text-sm text-muted-foreground">#{idx + 1}</span>
                                  <span className="font-mono text-sm">{job.jobId}</span>
                                  <span className="text-sm">{job.productId}</span>
                                  <Badge variant="outline" className="text-xs">Qty: {job.batchQty}</Badge>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDispatch(station.stationId, job.jobId)}
                                  >
                                    Dispatch
                                  </Button>
                                  <Button size="sm" variant="ghost">Remove</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="h-full p-6 overflow-auto">
            <div className="grid grid-cols-3 gap-4">
              {materials.map(material => {
                const status = getInventoryStatus(material);
                const availableKg = material.onhandKg - material.allocatedKg;

                return (
                  <Card key={material.materialId}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{material.name}</CardTitle>
                        <div className={`flex items-center gap-1 ${status.color}`}>
                          {status.icon}
                        </div>
                      </div>
                      <CardDescription className="text-xs">
                        {material.materialId} • {material.spec}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">On Hand:</span>
                          <span className="font-medium">{material.onhandKg.toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Allocated:</span>
                          <span className="font-medium">{material.allocatedKg.toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Available:</span>
                          <span className={`font-medium ${status.color}`}>
                            {availableKg.toLocaleString()} kg
                          </span>
                        </div>
                        {material.minLevel && (
                          <>
                            <Separator className="my-2" />
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Min Level:</span>
                              <span>{material.minLevel.toLocaleString()} kg</span>
                            </div>
                            <Progress
                              value={Math.min(100, (availableKg / material.minLevel) * 100)}
                              className="h-2"
                            />
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Molds Tab */}
          <TabsContent value="molds" className="h-full p-6 overflow-auto">
            <div className="grid grid-cols-3 gap-4">
              {molds.map(mold => {
                const lifePercentage = getMoldLifePercentage(mold);
                const lifeColor = lifePercentage > 50 ? 'text-green-600' : lifePercentage > 20 ? 'text-yellow-600' : 'text-red-600';

                return (
                  <Card key={mold.moldId}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{mold.moldId}</CardTitle>
                        <Badge variant="outline" className={lifeColor}>
                          {lifePercentage}% Life
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {mold.type} • {mold.currentStation || 'Available'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Usage:</span>
                          <span className="font-medium">
                            {mold.usageCount.toLocaleString()} / {mold.maxUsage.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={100 - lifePercentage} className="h-2" />
                        <div className="pt-2">
                          <span className="text-xs text-muted-foreground">Compatible Products:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {mold.compatibleProducts.map(product => (
                              <Badge key={product} variant="secondary" className="text-xs">
                                {product}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {lifePercentage < 20 && (
                          <Alert className="mt-2">
                            <AlertTriangle className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              Schedule maintenance soon
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Planning Tab */}
          <TabsContent value="plan" className="h-full p-6 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>Production Planning</CardTitle>
                <CardDescription>Draft plans pending dispatch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No draft plans available at this time
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-8 border-t px-6 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>UNS Broker: ws://broker.hivemq.com:8884/mqtt</span>
          <span>Topics: 24 active</span>
          <span>Messages: 0.2 msg/sec</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Last Sync: {new Date().toLocaleTimeString()}</span>
          <Badge variant="outline" className="text-xs">v1/FY-Fab</Badge>
        </div>
      </footer>
    </div>
  );
};

export default StationExecutionMonitor;