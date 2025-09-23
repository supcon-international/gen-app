import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Activity, Clock, AlertTriangle, RefreshCw, Search, X,
  Play, Users, Package, Loader2, WifiOff, Wifi
} from 'lucide-react';

// Types based on dashboard_spec requirements
interface QueueSnapshot {
  snapshot_ts: string;
  station_count: number;
  queued_jobs: number;
  running_jobs: number;
}

interface JobInfo {
  job_id: string;
  order_id?: string;
  product_id: string;
  product_name?: string;
  batch_qty: number;
  status?: 'queued' | 'running' | 'completed';
  start_time?: string;
  end_time?: string;
  expect_minutes?: number;
}

interface StationQueue {
  queued: JobInfo[];
  running: JobInfo[];
  snapshot_ts: string;
  type?: 'clean' | 'normal';
  reason?: string;
  expect_minutes?: number;
}

interface CurrentJob {
  job_id: string;
  status: 'idle' | 'queued' | 'running' | 'completed';
  batch_qty?: number;
  good_qty?: number;
  start_time?: string;
  operator_group?: string;
}

interface StationData {
  stationId: string;
  process: string; // LASER, BEND, COAT, ASSY, etc
  queue: StationQueue;
  currentJob?: CurrentJob;
  workgroup?: {
    group_id: string;
    per_shift_headcount: number;
    shifts: number;
  };
}

interface PlanDraft {
  plan_id: string;
  gen_ts: string;
  order_id: string;
  product_id: string;
  step_code: string;
  target_station: string;
  job_id: string;
  batch_qty: number;
  est_start_ts: string;
  est_end_ts: string;
  need_mold?: string;
  need_changeover?: string;
}

interface ProductMaster {
  product_id: string;
  name: string;
  route_step_1?: string;
  route_step_2?: string;
  route_step_3?: string;
  route_step_4?: string;
  default_station_1?: string;
  default_station_2?: string;
  default_station_3?: string;
  default_station_4?: string;
}

// Component
const StationDashboard = () => {
  // State - EARS Requirement 1, 2
  const [kpiData, setKpiData] = useState<QueueSnapshot>({
    snapshot_ts: new Date().toISOString(),
    station_count: 0,
    queued_jobs: 0,
    running_jobs: 0
  });

  const [stations, setStations] = useState<Map<string, StationData>>(new Map());
  const [planDrafts, setPlanDrafts] = useState<PlanDraft[]>([]);
  const [productMasters, setProductMasters] = useState<Map<string, ProductMaster>>(new Map());

  // Connection state - EARS Requirement 11
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Permissions - EARS Requirement 12
  const [hasOperationPermission, setHasOperationPermission] = useState(true);

  // Filters - EARS Requirement 4
  const [filterProcess, setFilterProcess] = useState<string>('all');
  const [filterStation, setFilterStation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Loading states
  const [isDispatchingMap, setIsDispatchingMap] = useState<Map<string, boolean>>(new Map());
  const [isStartingMap, setIsStartingMap] = useState<Map<string, boolean>>(new Map());

  // Update timestamp tracking for real-time updates - EARS Requirement 8
  const lastUpdateRef = useRef<Map<string, number>>(new Map());

  // MQTT Topics - Section 4.1
  const TOPICS = {
    QUEUE_SNAPSHOT: 'v1/FY-Fab/sched/state/queue-snapshot',
    PLAN_DRAFT: 'v1/FY-Fab/sched/state/plan-draft',
    // Station patterns (will expand with actual station IDs)
    STATION_QUEUE: 'v1/FY-Fab/sheet/+/state/queue',
    STATION_CURRENT_JOB: 'v1/FY-Fab/sheet/+/state/current-job',
    WIRE_STATION_QUEUE: 'v1/FY-Fab/wire/+/state/queue',
    WIRE_STATION_CURRENT_JOB: 'v1/FY-Fab/wire/+/state/current-job',
    // Optional data
    ORDER_REGISTRY: 'v1/FY-Fab/erp/state/order-registry',
    PRODUCT_MASTER: 'v1/FY-Fab/plm/state/product-master-+',
    WORKGROUP: 'v1/FY-Fab/workforce/state/workgroup-+'
  };

  // Initialize connection and subscriptions
  useEffect(() => {
    console.log('[MQTT] 🔌 Connecting to UNS broker: ws://broker.hivemq.com:8884/mqtt');

    // Simulate connection establishment
    setTimeout(() => {
      setIsConnected(true);
      console.log('[MQTT] ✅ Connected successfully');

      // Subscribe to all required topics
      const subscriptions = [
        TOPICS.QUEUE_SNAPSHOT,
        TOPICS.PLAN_DRAFT,
        'v1/FY-Fab/sheet/LASER01/state/queue',
        'v1/FY-Fab/sheet/LASER01/state/current-job',
        'v1/FY-Fab/sheet/BEND01/state/queue',
        'v1/FY-Fab/sheet/BEND01/state/current-job',
        'v1/FY-Fab/sheet/COAT01/state/queue',
        'v1/FY-Fab/sheet/COAT01/state/current-job',
        'v1/FY-Fab/sheet/ASSY01/state/queue',
        'v1/FY-Fab/sheet/ASSY01/state/current-job',
        'v1/FY-Fab/sheet/ASSY02/state/queue',
        'v1/FY-Fab/sheet/ASSY02/state/current-job',
        'v1/FY-Fab/plm/state/product-master-P-PANEL1',
        'v1/FY-Fab/plm/state/product-master-P-PANEL2',
        'v1/FY-Fab/workforce/state/workgroup-OP_LASER',
        'v1/FY-Fab/workforce/state/workgroup-OP_BEND',
        'v1/FY-Fab/workforce/state/workgroup-OP_COAT',
        'v1/FY-Fab/workforce/state/workgroup-OP_ASSY'
      ];

      subscriptions.forEach(topic => {
        console.log(`[MQTT] 📥 Subscribing to: ${topic}`);
      });

      // Simulate initial data load
      simulateInitialData();
    }, 1000);

    // Cleanup
    return () => {
      console.log('[MQTT] 🔌 Disconnecting from broker');
      setIsConnected(false);
    };
  }, []);

  // Simulate initial data and periodic updates
  const simulateInitialData = () => {
    // EARS Requirement 1 - Queue snapshot
    const snapshot: QueueSnapshot = {
      snapshot_ts: new Date().toISOString(),
      station_count: 5,
      queued_jobs: 12,
      running_jobs: 3
    };
    setKpiData(snapshot);
    console.log('[MQTT] 📨 Received queue-snapshot:', snapshot);

    // EARS Requirement 2 - Station data
    const stationData = new Map<string, StationData>();

    // LASER01 - Running
    stationData.set('LASER01', {
      stationId: 'LASER01',
      process: 'LASER',
      queue: {
        queued: [
          { job_id: 'JOB-LZ-002', product_id: 'P-PANEL1', batch_qty: 10, order_id: 'PO-202507-1002' },
          { job_id: 'JOB-LZ-003', product_id: 'P-PANEL2', batch_qty: 5, order_id: 'PO-202507-1003' }
        ],
        running: [
          { job_id: 'JOB-LZ-001', product_id: 'P-PANEL1', batch_qty: 5, start_time: new Date(Date.now() - 10 * 60000).toISOString() }
        ],
        snapshot_ts: new Date().toISOString()
      },
      currentJob: {
        job_id: 'JOB-LZ-001',
        status: 'running',
        batch_qty: 5,
        good_qty: 3,
        start_time: new Date(Date.now() - 10 * 60000).toISOString(),
        operator_group: 'OP_LASER'
      },
      workgroup: {
        group_id: 'OP_LASER',
        per_shift_headcount: 1,
        shifts: 2
      }
    });

    // COAT01 - Cleaning (EARS Requirement 3)
    stationData.set('COAT01', {
      stationId: 'COAT01',
      process: 'COAT',
      queue: {
        queued: [
          { job_id: 'JOB-CT-001', product_id: 'P-PANEL1', batch_qty: 5, order_id: 'PO-202507-1004' }
        ],
        running: [],
        snapshot_ts: new Date().toISOString(),
        type: 'clean',
        reason: 'color_change',
        expect_minutes: 30
      },
      workgroup: {
        group_id: 'OP_COAT',
        per_shift_headcount: 1,
        shifts: 2
      }
    });

    // BEND01 - Idle
    stationData.set('BEND01', {
      stationId: 'BEND01',
      process: 'BEND',
      queue: {
        queued: [],
        running: [],
        snapshot_ts: new Date().toISOString()
      },
      currentJob: {
        job_id: '',
        status: 'idle'
      },
      workgroup: {
        group_id: 'OP_BEND',
        per_shift_headcount: 1,
        shifts: 2
      }
    });

    // ASSY01 - Queued
    stationData.set('ASSY01', {
      stationId: 'ASSY01',
      process: 'ASSY',
      queue: {
        queued: [
          { job_id: 'JOB-AS-001', product_id: 'P-PANEL1', batch_qty: 5, order_id: 'PO-202507-1005' },
          { job_id: 'JOB-AS-002', product_id: 'P-PANEL2', batch_qty: 10, order_id: 'PO-202507-1006' }
        ],
        running: [],
        snapshot_ts: new Date().toISOString()
      },
      currentJob: {
        job_id: 'JOB-AS-001',
        status: 'queued',
        batch_qty: 5
      },
      workgroup: {
        group_id: 'OP_ASSY',
        per_shift_headcount: 2,
        shifts: 2
      }
    });

    // ASSY02 - Running
    stationData.set('ASSY02', {
      stationId: 'ASSY02',
      process: 'ASSY',
      queue: {
        queued: [
          { job_id: 'JOB-AS-004', product_id: 'P-PANEL2', batch_qty: 8, order_id: 'PO-202507-1007' }
        ],
        running: [
          { job_id: 'JOB-AS-003', product_id: 'P-PANEL2', batch_qty: 10, start_time: new Date(Date.now() - 20 * 60000).toISOString() }
        ],
        snapshot_ts: new Date().toISOString()
      },
      currentJob: {
        job_id: 'JOB-AS-003',
        status: 'running',
        batch_qty: 10,
        good_qty: 7,
        start_time: new Date(Date.now() - 20 * 60000).toISOString(),
        operator_group: 'OP_ASSY'
      },
      workgroup: {
        group_id: 'OP_ASSY',
        per_shift_headcount: 2,
        shifts: 2
      }
    });

    setStations(stationData);

    // EARS Requirement 10 - Plan drafts
    const drafts: PlanDraft[] = [
      {
        plan_id: 'PLAN-2025-09-05-01',
        gen_ts: new Date().toISOString(),
        order_id: 'PO-202507-1008',
        product_id: 'P-PANEL1',
        step_code: 'LASER',
        target_station: 'LASER01',
        job_id: 'JOB-LZ-004',
        batch_qty: 15,
        est_start_ts: new Date(Date.now() + 30 * 60000).toISOString(),
        est_end_ts: new Date(Date.now() + 60 * 60000).toISOString()
      }
    ];
    setPlanDrafts(drafts);
    console.log('[MQTT] 📨 Received plan-draft:', drafts);

    // EARS Requirement 13 - Product master data
    const products = new Map<string, ProductMaster>();
    products.set('P-PANEL1', {
      product_id: 'P-PANEL1',
      name: '钣金面板 A',
      route_step_1: 'LASER',
      route_step_2: 'BEND',
      route_step_3: 'COAT',
      route_step_4: 'ASSY',
      default_station_1: 'LASER01',
      default_station_2: 'BEND01',
      default_station_3: 'COAT01',
      default_station_4: 'ASSY01'
    });
    products.set('P-PANEL2', {
      product_id: 'P-PANEL2',
      name: '钣金面板 B',
      route_step_1: 'LASER',
      route_step_2: 'BEND',
      route_step_3: 'COAT',
      route_step_4: 'ASSY',
      default_station_1: 'LASER01',
      default_station_2: 'BEND01',
      default_station_3: 'COAT01',
      default_station_4: 'ASSY02'
    });
    setProductMasters(products);
  };

  // EARS Requirement 8 - Real-time updates within 1 second
  useEffect(() => {
    if (!isConnected) return;

    const updateInterval = setInterval(() => {
      // Simulate receiving real-time updates
      const now = Date.now();
      stations.forEach((station, stationId) => {
        const lastUpdate = lastUpdateRef.current.get(stationId) || 0;
        if (now - lastUpdate > 5000) { // Update every 5 seconds for demo
          console.log(`[MQTT] 📨 Update for station ${stationId}`);

          // Simulate progress update
          if (station.currentJob?.status === 'running' && station.currentJob.good_qty !== undefined) {
            const updatedStation = { ...station };
            updatedStation.currentJob = {
              ...station.currentJob,
              good_qty: Math.min(station.currentJob.batch_qty || 0, (station.currentJob.good_qty || 0) + 1)
            };
            setStations(prev => new Map(prev).set(stationId, updatedStation));
          }

          lastUpdateRef.current.set(stationId, now);
        }
      });

      // Update KPI snapshot
      const snapshot: QueueSnapshot = {
        snapshot_ts: new Date().toISOString(),
        station_count: stations.size,
        queued_jobs: Array.from(stations.values()).reduce((sum, s) => sum + s.queue.queued.length, 0),
        running_jobs: Array.from(stations.values()).reduce((sum, s) => sum + s.queue.running.length, 0)
      };
      setKpiData(snapshot);
    }, 1000); // Check every second as per requirement

    return () => clearInterval(updateInterval);
  }, [isConnected, stations]);

  // Action handlers - Section 4.2
  const handleDispatch = useCallback(async (stationId: string, jobId: string, productId: string) => {
    if (!isConnected || !hasOperationPermission) {
      toast.error('操作不可用');
      return;
    }

    setIsDispatchingMap(prev => new Map(prev).set(jobId, true));

    const topic = `v1/FY-Fab/sheet/${stationId}/action/dispatch-task`;
    const payload = {
      job_ids: [jobId],
      order_id: 'PO-202507-XXXX',
      product_id: productId,
      step_code: stations.get(stationId)?.process,
      batch_qty: 5
    };

    console.log(`[MQTT] 📤 Publishing to: ${topic}`);
    console.log('[MQTT] Payload:', payload);

    // Simulate dispatch success
    setTimeout(() => {
      toast.success(`任务 ${jobId} 已派工到 ${stationId}`);
      setIsDispatchingMap(prev => new Map(prev).set(jobId, false));

      // Optimistic update - move from draft to queue
      setPlanDrafts(prev => prev.filter(d => d.job_id !== jobId));
      const station = stations.get(stationId);
      if (station) {
        const updatedStation = { ...station };
        updatedStation.queue.queued.push({
          job_id: jobId,
          product_id: productId,
          batch_qty: 5
        });
        setStations(prev => new Map(prev).set(stationId, updatedStation));
      }
    }, 1000);
  }, [isConnected, hasOperationPermission, stations]);

  const handleStart = useCallback(async (stationId: string, jobId: string) => {
    if (!isConnected || !hasOperationPermission) {
      toast.error('操作不可用');
      return;
    }

    setIsStartingMap(prev => new Map(prev).set(jobId, true));

    const topic = `v1/FY-Fab/sheet/${stationId}/action/start-task`;
    const payload = {
      job_id: jobId,
      operator_group: `OP_${stations.get(stationId)?.process}`,
      expect_minutes: 30
    };

    console.log(`[MQTT] 📤 Publishing to: ${topic}`);
    console.log('[MQTT] Payload:', payload);

    // Simulate start success
    setTimeout(() => {
      toast.success(`任务 ${jobId} 已开始`);
      setIsStartingMap(prev => new Map(prev).set(jobId, false));

      // Optimistic update - move from queued to running
      const station = stations.get(stationId);
      if (station) {
        const job = station.queue.queued.find(j => j.job_id === jobId);
        if (job) {
          const updatedStation = { ...station };
          updatedStation.queue.queued = station.queue.queued.filter(j => j.job_id !== jobId);
          updatedStation.queue.running = [...station.queue.running, { ...job, start_time: new Date().toISOString() }];
          updatedStation.currentJob = {
            job_id: jobId,
            status: 'running',
            batch_qty: job.batch_qty,
            good_qty: 0,
            start_time: new Date().toISOString(),
            operator_group: payload.operator_group
          };
          setStations(prev => new Map(prev).set(stationId, updatedStation));
        }
      }
    }, 1000);
  }, [isConnected, hasOperationPermission, stations]);

  const handleCleanStart = useCallback(async (stationId: string) => {
    if (!isConnected || !hasOperationPermission) {
      toast.error('操作不可用');
      return;
    }

    const topic = `v1/FY-Fab/sheet/${stationId}/action/clean-start`;
    console.log(`[MQTT] 📤 Publishing to: ${topic}`);
    toast.info(`清线操作已发送到 ${stationId}`);
  }, [isConnected, hasOperationPermission]);

  const handleReconnect = useCallback(() => {
    setIsReconnecting(true);
    console.log('[MQTT] 🔄 Attempting to reconnect...');

    setTimeout(() => {
      setIsConnected(true);
      setIsReconnecting(false);
      toast.success('已重新连接到 UNS');
      simulateInitialData();
    }, 2000);
  }, []);

  // Helper functions
  const getStationStatus = (station: StationData): string => {
    if (station.queue.type === 'clean') return 'cleaning';
    if (station.currentJob?.status === 'running') return 'running';
    if (station.queue.queued.length > 0) return 'queued';
    return 'idle';
  };

  // Filter logic - EARS Requirement 4
  const filteredStations = Array.from(stations.values()).filter(station => {
    // Process filter
    if (filterProcess !== 'all' && station.process !== filterProcess) return false;

    // Station filter
    if (filterStation !== 'all' && station.stationId !== filterStation) return false;

    // Status filter
    if (filterStatus !== 'all') {
      const status = getStationStatus(station);
      if (status !== filterStatus) return false;
    }

    // Search query - search in job IDs, product IDs, order IDs
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesQueue = station.queue.queued.some(job =>
        job.job_id.toLowerCase().includes(query) ||
        job.product_id.toLowerCase().includes(query) ||
        job.order_id?.toLowerCase().includes(query)
      );
      const matchesRunning = station.queue.running.some(job =>
        job.job_id.toLowerCase().includes(query) ||
        job.product_id.toLowerCase().includes(query) ||
        job.order_id?.toLowerCase().includes(query)
      );
      const matchesCurrentJob = station.currentJob?.job_id.toLowerCase().includes(query);

      if (!matchesQueue && !matchesRunning && !matchesCurrentJob) return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      running: { label: '运行中', className: 'bg-green-100 text-green-800 border-green-200' },
      queued: { label: '排队中', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      cleaning: { label: '清线中', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      idle: { label: '空闲', className: 'bg-gray-100 text-gray-600 border-gray-200' }
    };
    const config = configs[status] || configs.idle;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getProductName = (productId: string): string => {
    return productMasters.get(productId)?.name || productId;
  };

  const formatTimestamp = (timestamp?: string): string => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('zh-CN');
  };

  const calculateRemainingMinutes = (station: StationData): number => {
    if (station.queue.type !== 'clean' || !station.queue.expect_minutes) return 0;
    // In real implementation, would calculate based on actual start time
    return Math.max(0, station.queue.expect_minutes - 5); // Mock: 5 minutes elapsed
  };

  return (
    <div className="min-h-screen bg-background">
      {/* EARS Requirement 1 - Top KPI Cards */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">工站执行 Dashboard</h1>
            <div className="flex items-center gap-4">
              {/* Connection status - EARS Requirement 11 */}
              {isConnected ? (
                <Badge variant="outline" className="gap-1">
                  <Wifi className="h-3 w-3" />
                  已连接 UNS
                </Badge>
              ) : (
                <Alert className="py-1 px-3">
                  <WifiOff className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    离线 - 数据可能不是最新
                    <Button
                      size="sm"
                      variant="link"
                      onClick={handleReconnect}
                      disabled={isReconnecting}
                      className="ml-2 p-0 h-auto"
                    >
                      {isReconnecting ? <Loader2 className="h-3 w-3 animate-spin" /> : '重试'}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              <span className="text-sm text-muted-foreground">
                快照时间: {formatTimestamp(kpiData.snapshot_ts)}
              </span>
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{new Date().toLocaleTimeString('zh-CN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">站点数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpiData.station_count}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">运行中任务</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{kpiData.running_jobs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">排队任务</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{kpiData.queued_jobs}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* EARS Requirement 4 - Filter Bar */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Select value={filterProcess} onValueChange={setFilterProcess}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="工序" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部工序</SelectItem>
                <SelectItem value="LASER">LASER 激光切割</SelectItem>
                <SelectItem value="BEND">BEND 折弯</SelectItem>
                <SelectItem value="COAT">COAT 喷涂</SelectItem>
                <SelectItem value="ASSY">ASSY 组装</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStation} onValueChange={setFilterStation}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="工站" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部工站</SelectItem>
                {Array.from(stations.keys()).map(stationId => (
                  <SelectItem key={stationId} value={stationId}>{stationId}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="running">运行中</SelectItem>
                <SelectItem value="queued">排队中</SelectItem>
                <SelectItem value="cleaning">清洗中</SelectItem>
                <SelectItem value="idle">空闲</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索订单/产品..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterProcess('all');
                setFilterStation('all');
                setFilterStatus('all');
                setSearchQuery('');
              }}
            >
              <X className="h-4 w-4 mr-1" />
              清空筛选
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* EARS Requirement 2, 3, 5 - Station Cards */}
          {filteredStations.map(station => {
            const status = getStationStatus(station);
            const isCleaningOrChangeover = station.queue.type === 'clean';

            return (
              <Card key={station.stationId} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{station.stationId}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {station.process} 工序
                        {/* EARS Requirement 14 - Workforce info */}
                        {station.workgroup && (
                          <span className="ml-2">
                            • {station.workgroup.per_shift_headcount}人/班 × {station.workgroup.shifts}班
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    {getStatusBadge(status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* EARS Requirement 3 - Cleaning/Changeover Status */}
                  {isCleaningOrChangeover && (
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm">
                        <div className="font-medium">
                          {station.queue.reason === 'color_change' ? '换色清洗' : '清线维护'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          剩余时间: {calculateRemainingMinutes(station)} 分钟
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* EARS Requirement 5 - Current Job Details */}
                  {station.currentJob && station.currentJob.job_id && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">当前任务</div>
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">任务ID:</span>
                          <span className="font-mono">{station.currentJob.job_id}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">状态:</span>
                          <span>{station.currentJob.status}</span>
                        </div>
                        {station.currentJob.batch_qty && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">批量:</span>
                            <span>
                              {station.currentJob.good_qty || 0}/{station.currentJob.batch_qty}
                            </span>
                          </div>
                        )}
                        {station.currentJob.start_time && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">开始时间:</span>
                            <span>{formatTimestamp(station.currentJob.start_time)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Queue Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">队列详情</span>
                      <div className="flex gap-3 text-xs">
                        <span>排队: {station.queue.queued.length}</span>
                        <span>运行: {station.queue.running.length}</span>
                      </div>
                    </div>

                    {station.queue.queued.length > 0 && (
                      <ScrollArea className="h-24 w-full rounded border">
                        <div className="p-2 space-y-1">
                          {station.queue.queued.slice(0, 3).map((job, idx) => (
                            <div key={job.job_id} className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="font-mono">{job.job_id}</span>
                                <Badge variant="outline" className="text-xs h-5">
                                  {job.batch_qty} 件
                                </Badge>
                              </div>
                              {/* EARS Requirement 13 - Product name */}
                              <div className="text-muted-foreground">
                                {getProductName(job.product_id)}
                              </div>
                            </div>
                          ))}
                          {station.queue.queued.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center">
                              还有 {station.queue.queued.length - 3} 个任务...
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    )}
                  </div>

                  {/* EARS Requirement 6 - Operation Buttons */}
                  {hasOperationPermission && isConnected && (
                    <div className="flex gap-2 pt-2">
                      {status === 'idle' && station.queue.queued.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          disabled={isStartingMap.get(station.queue.queued[0].job_id)}
                          onClick={() => handleStart(station.stationId, station.queue.queued[0].job_id)}
                        >
                          {isStartingMap.get(station.queue.queued[0].job_id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              开始
                            </>
                          )}
                        </Button>
                      )}
                      {isCleaningOrChangeover && station.process === 'COAT' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleCleanStart(station.stationId)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          清线启动
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-xs text-muted-foreground text-right">
                    更新: {formatTimestamp(station.queue.snapshot_ts)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* EARS Requirement 10 - Plan Draft Section */}
        {planDrafts.length > 0 && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>待派工任务</CardTitle>
                <CardDescription>来自计划草案的建议任务</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {planDrafts.map(draft => (
                    <div key={draft.job_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm">{draft.job_id}</span>
                          <Badge variant="outline">{draft.step_code}</Badge>
                          <span className="text-sm text-muted-foreground">
                            → {draft.target_station}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getProductName(draft.product_id)} • {draft.batch_qty} 件
                          • 预计 {new Date(draft.est_start_ts).toLocaleTimeString('zh-CN')} 开始
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={isDispatchingMap.get(draft.job_id) || !isConnected || !hasOperationPermission}
                        onClick={() => handleDispatch(draft.target_station, draft.job_id, draft.product_id)}
                      >
                        {isDispatchingMap.get(draft.job_id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Package className="h-4 w-4 mr-1" />
                            派工
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty state */}
        {filteredStations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>没有符合筛选条件的工站</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationDashboard;