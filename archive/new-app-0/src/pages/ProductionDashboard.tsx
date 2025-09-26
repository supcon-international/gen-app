import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, RadialBarChart, RadialBar } from 'recharts';
import { AlertCircle, AlertTriangle, Info, Clock, Activity, Package, Users, Settings, PlayCircle, PauseCircle, CheckCircle } from 'lucide-react';

interface StationData {
  stationId: string;
  status: 'idle' | 'running' | 'queued' | 'maintenance' | 'cleaning';
  currentJob?: {
    jobId: string;
    productId: string;
    batchQty: number;
    startTime?: string;
    progress: number;
  };
  queuedCount: number;
  runningCount: number;
  cleaningInfo?: {
    type: string;
    reason: string;
    expectMinutes: number;
    startTime: string;
  };
}

interface AlertItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  station?: string;
  message: string;
  acknowledged: boolean;
}

const ProductionDashboard = () => {
  // Mock MQTT state for now - will integrate with actual MQTT provider later
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [stations, setStations] = useState<StationData[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [kpiData, setKpiData] = useState({
    stationCount: 0,
    runningJobs: 0,
    queuedJobs: 0,
    snapshotTime: new Date().toISOString()
  });

  const [selectedProcess, setSelectedProcess] = useState<string>('all');
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock subscribe function
  const subscribe = (topic: string) => {
    console.log(`[MQTT] 🔔 Dynamic subscription to: ${topic}`);
  };

  // Mock publish function
  const publish = (topic: string, message: string) => {
    console.log(`[MQTT] 📤 Publishing message to topic: ${topic}`);
    console.log(`[MQTT] Message payload:`, JSON.parse(message));
    console.log(`[MQTT] ✅ Message published successfully`);
  };

  useEffect(() => {
    // Simulate connection after mount
    console.log('[MQTT] Initializing connection to broker: ws://broker.hivemq.com:8884/mqtt');
    setTimeout(() => {
      setIsConnected(true);
      console.log('[MQTT] ✅ Successfully connected to broker');
      console.log('[MQTT] Connection status: CONNECTED');

      // Log topic subscriptions
      const topics = [
        'v1/FY-Fab/sched/state/queue-snapshot',
        'v1/FY-Fab/sheet/+/state/queue',
        'v1/FY-Fab/sheet/+/state/current-job',
        'v1/FY-Fab/sched/state/plan-draft'
      ];

      console.log('[MQTT] Subscribing to topics:');
      topics.forEach(topic => {
        console.log(`[MQTT] 📥 Subscribing to: ${topic}`);
      });
      console.log('[MQTT] All subscriptions completed');
    }, 1000);

    // Mock some initial station data
    setStations([
      { stationId: 'LASER01', status: 'running', queuedCount: 3, runningCount: 1, currentJob: { jobId: 'JOB-001', productId: 'P-001', batchQty: 50, progress: 45 } },
      { stationId: 'LASER02', status: 'idle', queuedCount: 0, runningCount: 0 },
      { stationId: 'COAT01', status: 'cleaning', queuedCount: 2, runningCount: 0, cleaningInfo: { type: 'clean', reason: 'color_change', expectMinutes: 30, startTime: new Date().toISOString() } },
      { stationId: 'ASSY01', status: 'running', queuedCount: 5, runningCount: 2, currentJob: { jobId: 'JOB-002', productId: 'P-002', batchQty: 100, progress: 72 } },
      { stationId: 'ASSY02', status: 'queued', queuedCount: 4, runningCount: 0 },
    ]);

    // Mock KPI data
    setKpiData({
      stationCount: 5,
      runningJobs: 3,
      queuedJobs: 14,
      snapshotTime: new Date().toISOString()
    });

    // Simulate receiving messages
    setTimeout(() => {
      console.log('[MQTT] 📨 Received message on topic: v1/FY-Fab/sched/state/queue-snapshot');
      console.log('[MQTT] Message data:', {
        station_count: 5,
        running_jobs: 3,
        queued_jobs: 14,
        snapshot_ts: new Date().toISOString()
      });
    }, 2000);

    setTimeout(() => {
      console.log('[MQTT] 📨 Received message on topic: v1/FY-Fab/sheet/LASER01/state/queue');
      console.log('[MQTT] Message data:', {
        queued: ['JOB-003', 'JOB-004', 'JOB-005'],
        running: ['JOB-001'],
        snapshot_ts: new Date().toISOString()
      });
    }, 2500);

    setTimeout(() => {
      console.log('[MQTT] 📨 Received message on topic: v1/FY-Fab/sheet/COAT01/state/queue');
      console.log('[MQTT] Message data:', {
        type: 'clean',
        reason: 'color_change',
        expect_minutes: 30,
        queued: ['JOB-006', 'JOB-007'],
        running: []
      });
    }, 3000);

    // Log connection heartbeat
    const heartbeatInterval = setInterval(() => {
      if (isConnected) {
        console.log('[MQTT] 💓 Connection heartbeat - Status: ALIVE');
      }
    }, 30000); // Every 30 seconds

    return () => {
      console.log('[MQTT] 🔌 Disconnecting from broker...');
      clearInterval(heartbeatInterval);
      console.log('[MQTT] Connection closed');
    };
  }, [isConnected]);

  const updateStationData = (stationId: string, type: string, data: any) => {
    setStations(prev => {
      const existing = prev.find(s => s.stationId === stationId);
      if (existing) {
        return prev.map(s => {
          if (s.stationId === stationId) {
            if (type === 'queue') {
              return {
                ...s,
                queuedCount: data.queued?.length || 0,
                runningCount: data.running?.length || 0,
                status: data.type === 'clean' ? 'cleaning' : s.status,
                cleaningInfo: data.type === 'clean' ? {
                  type: data.type,
                  reason: data.reason,
                  expectMinutes: data.expect_minutes,
                  startTime: new Date().toISOString()
                } : undefined
              };
            } else if (type === 'currentJob') {
              return {
                ...s,
                currentJob: data.job_id ? {
                  jobId: data.job_id,
                  productId: data.product_id,
                  batchQty: data.batch_qty,
                  startTime: data.start_time,
                  progress: data.progress || 0
                } : undefined,
                status: data.status === 'running' ? 'running' : (data.job_id ? 'queued' : 'idle')
              };
            }
          }
          return s;
        });
      } else {
        return [...prev, {
          stationId,
          status: 'idle',
          queuedCount: 0,
          runningCount: 0
        }];
      }
    });
  };

  const handleDispatchTask = (stationId: string, jobId: string) => {
    const topic = `v1/FY-Fab/sheet/${stationId}/action/dispatch-task`;
    publish(topic, JSON.stringify({
      job_ids: [jobId],
      timestamp: new Date().toISOString()
    }));
  };

  const handleStartTask = (stationId: string, jobId: string) => {
    const topic = `v1/FY-Fab/sheet/${stationId}/action/start-task`;
    publish(topic, JSON.stringify({
      job_id: jobId,
      operator_group: 'A-Shift',
      expect_minutes: 30,
      timestamp: new Date().toISOString()
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'queued': return 'bg-yellow-500';
      case 'idle': return 'bg-gray-400';
      case 'maintenance': return 'bg-orange-500';
      case 'cleaning': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <PlayCircle className="h-4 w-4" />;
      case 'queued': return <Clock className="h-4 w-4" />;
      case 'idle': return <PauseCircle className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      case 'cleaning': return <Package className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const mockOEEData = [
    { time: '00:00', value: 85 },
    { time: '04:00', value: 87 },
    { time: '08:00', value: 92 },
    { time: '12:00', value: 88 },
    { time: '16:00', value: 90 },
    { time: '20:00', value: 86 },
  ];

  const mockProductionData = [
    { hour: '08', actual: 45, target: 50 },
    { hour: '09', actual: 48, target: 50 },
    { hour: '10', actual: 52, target: 50 },
    { hour: '11', actual: 49, target: 50 },
    { hour: '12', actual: 30, target: 50 },
  ];

  const mockQualityData = [
    { name: 'Good', value: 92, fill: 'hsl(var(--primary))' },
    { name: 'Rework', value: 5, fill: 'hsl(var(--muted))' },
    { name: 'Scrap', value: 3, fill: 'hsl(var(--destructive))' },
  ];

  const mockRadialData = [
    { name: 'Active Jobs', value: 75, fill: 'hsl(var(--primary))' }
  ];

  const filteredStations = stations.filter(station => {
    if (selectedProcess !== 'all' && !station.stationId.includes(selectedProcess.toUpperCase())) return false;
    if (selectedStation !== 'all' && station.stationId !== selectedStation) return false;
    if (selectedStatus !== 'all' && station.status !== selectedStatus) return false;
    if (searchQuery && !station.stationId.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !station.currentJob?.jobId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="h-16 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">FY-Fab Production Monitor</h1>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleString()}
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6">
        <div className="h-full overflow-y-auto space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Active Jobs</CardTitle>
                <CardDescription>{kpiData.runningJobs}</CardDescription>
              </CardHeader>
              <CardContent className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart data={mockRadialData} innerRadius="60%" outerRadius="90%">
                    <RadialBar dataKey="value" cornerRadius={10} fill="hsl(var(--primary))" />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">OEE %</CardTitle>
                <CardDescription>90%</CardDescription>
              </CardHeader>
              <CardContent className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockOEEData}>
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Production Rate</CardTitle>
                <CardDescription>48 pcs/hr</CardDescription>
              </CardHeader>
              <CardContent className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockProductionData}>
                    <Bar dataKey="actual" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quality Rate</CardTitle>
                <CardDescription>92%</CardDescription>
              </CardHeader>
              <CardContent className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={mockQualityData} dataKey="value" innerRadius="60%" outerRadius="90%" paddingAngle={2}>
                      {mockQualityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Select value={selectedProcess} onValueChange={setSelectedProcess}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Process" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Processes</SelectItem>
                <SelectItem value="laser">LASER</SelectItem>
                <SelectItem value="bend">BEND</SelectItem>
                <SelectItem value="coat">COAT</SelectItem>
                <SelectItem value="assy">ASSY</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Station" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                {stations.map(s => (
                  <SelectItem key={s.stationId} value={s.stationId}>{s.stationId}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search job or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />

            <Button variant="outline" onClick={() => {
              setSelectedProcess('all');
              setSelectedStation('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }}>
              Clear Filters
            </Button>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <Card>
                <CardHeader>
                  <CardTitle>Equipment Status</CardTitle>
                  <CardDescription>Real-time station monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {filteredStations.map(station => (
                      <Card key={station.stationId} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(station.status)}
                            <span className="font-medium">{station.stationId}</span>
                          </div>
                          <Badge className={getStatusColor(station.status)}>
                            {station.status}
                          </Badge>
                        </div>

                        {station.cleaningInfo && (
                          <Alert className="mb-2">
                            <AlertDescription className="text-xs">
                              {station.cleaningInfo.reason} - {station.cleaningInfo.expectMinutes} min
                            </AlertDescription>
                          </Alert>
                        )}

                        {station.currentJob && (
                          <div className="space-y-1 text-xs">
                            <div>Job: {station.currentJob.jobId}</div>
                            <div>Qty: {station.currentJob.batchQty}</div>
                            <Progress value={station.currentJob.progress} className="h-1" />
                          </div>
                        )}

                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          <span>Queue: {station.queuedCount}</span>
                          <span>Running: {station.runningCount}</span>
                        </div>

                        {station.status === 'idle' && (
                          <div className="flex gap-1 mt-2">
                            <Button size="sm" variant="outline" className="flex-1 text-xs"
                              onClick={() => handleDispatchTask(station.stationId, 'JOB-001')}>
                              Dispatch
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 text-xs"
                              onClick={() => handleStartTask(station.stationId, 'JOB-001')}>
                              Start
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-4">
              <Card className="h-[400px]">
                <CardHeader>
                  <CardTitle>Active Alerts</CardTitle>
                  <CardDescription>System notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {alerts.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          No active alerts
                        </div>
                      ) : (
                        alerts.map(alert => (
                          <Alert key={alert.id}>
                            <div className="flex items-start gap-2">
                              {alert.severity === 'critical' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                              {alert.severity === 'warning' && <AlertCircle className="h-4 w-4 text-orange-500" />}
                              {alert.severity === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                              <div className="flex-1">
                                <AlertDescription className="text-xs">
                                  {alert.message}
                                </AlertDescription>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {alert.station && `${alert.station} • `}
                                  {new Date(alert.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          </Alert>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <Card className="h-[350px]">
                <CardHeader>
                  <CardTitle>Production Schedule</CardTitle>
                  <CardDescription>24-hour timeline view</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Gantt chart placeholder - Timeline visualization
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-6">
              <Card className="h-[350px]">
                <CardHeader>
                  <CardTitle>Material & Tooling Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="materials" className="h-full">
                    <TabsList>
                      <TabsTrigger value="materials">Materials</TabsTrigger>
                      <TabsTrigger value="molds">Molds</TabsTrigger>
                      <TabsTrigger value="changeover">Changeover</TabsTrigger>
                    </TabsList>
                    <TabsContent value="materials" className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { material: 'Steel Sheet A', inventory: 850, min: 200 },
                          { material: 'Steel Sheet B', inventory: 420, min: 300 },
                          { material: 'Coating Powder', inventory: 150, min: 100 },
                          { material: 'Assembly Parts', inventory: 320, min: 250 },
                        ]} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="material" type="category" width={100} />
                          <Bar dataKey="inventory" fill="hsl(var(--primary))" />
                          <Bar dataKey="min" fill="hsl(var(--destructive))" opacity={0.3} />
                        </BarChart>
                      </ResponsiveContainer>
                    </TabsContent>
                    <TabsContent value="molds" className="h-[200px]">
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Mold A-001</span>
                            <span>85% life remaining</span>
                          </div>
                          <Progress value={85} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Mold B-002</span>
                            <span>60% life remaining</span>
                          </div>
                          <Progress value={60} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Mold C-003</span>
                            <span>92% life remaining</span>
                          </div>
                          <Progress value={92} />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="changeover" className="h-[200px]">
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Changeover matrix heatmap visualization
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <Card className="h-[200px]">
                <CardHeader>
                  <CardTitle>Control Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Dispatch</h4>
                      <div className="space-y-2">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="job1">JOB-001</SelectItem>
                            <SelectItem value="job2">JOB-002</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button className="w-full" size="sm">Dispatch to Station</Button>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Start/Stop</h4>
                      <div className="space-y-2">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select station" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="laser01">LASER01</SelectItem>
                            <SelectItem value="coat01">COAT01</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button className="flex-1" size="sm" variant="outline">Start</Button>
                          <Button className="flex-1" size="sm" variant="outline">Stop</Button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Changeover</h4>
                      <div className="space-y-2">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clean">Cleaning</SelectItem>
                            <SelectItem value="setup">Setup</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button className="w-full" size="sm">Initiate</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-4">
              <Card className="h-[200px]">
                <CardHeader>
                  <CardTitle>Message Feed</CardTitle>
                  <CardDescription>MQTT messages</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[100px]">
                    <div className="space-y-1 font-mono text-xs">
                      {Object.entries(messages).slice(-10).map(([topic, payload], idx) => (
                        <div key={idx} className="text-muted-foreground">
                          <span className="text-primary">{topic}:</span> {payload.substring(0, 50)}...
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-8 border-t flex items-center justify-between px-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>MQTT: {isConnected ? 'Connected' : 'Disconnected'}</span>
          <span>Messages: {Object.keys(messages).length}/sec</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Last Update: {new Date(kpiData.snapshotTime).toLocaleTimeString()}</span>
          <Badge variant="outline">0 Errors</Badge>
        </div>
      </footer>
    </div>
  );
};

export default ProductionDashboard;