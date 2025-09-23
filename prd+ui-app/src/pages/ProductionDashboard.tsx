import { useEffect, useState, useRef } from "react";
import { useMQTT } from "@/mqtt/MQTTProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Activity, AlertTriangle, Factory, Gauge, Package,
  Wrench, Send, Play, Square, RefreshCw, Wifi, WifiOff
} from "lucide-react";

interface EquipmentStatus {
  stationId: string;
  status: 'idle' | 'running' | 'queued' | 'maintenance' | 'error';
  currentJob?: string;
  batchQty?: number;
  lastUpdate: number;
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: number;
  station?: string;
  message: string;
  acknowledged: boolean;
}

interface MaterialInventory {
  materialId: string;
  name: string;
  type: string;
  onhandKg: number;
  allocatedKg: number;
}

interface ProductionJob {
  jobId: string;
  orderId: string;
  productId: string;
  targetStation: string;
  estStartTime?: string;
  estEndTime?: string;
  batchQty: number;
}

export default function ProductionDashboard() {
  const { state, subscribe, publish } = useMQTT();
  const [equipment, setEquipment] = useState<Map<string, EquipmentStatus>>(new Map());
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [materials, setMaterials] = useState<Map<string, MaterialInventory>>(new Map());
  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [messages, setMessages] = useState<Array<{topic: string; payload: string; ts: number}>>([]);
  const [metrics, setMetrics] = useState({
    activeJobs: 0,
    oee: 0,
    productionRate: 0,
    qualityRate: 0
  });

  // Control form states
  const [selectedStation, setSelectedStation] = useState("");
  const [jobId, setJobId] = useState("");
  const [batchQty, setBatchQty] = useState("");

  const messageCount = useRef(0);

  // Subscribe to topics when connected
  useEffect(() => {
    if (state.status === 'connected') {
      console.log('MQTT Connected successfully');
      // Subscribe to all FY-Fab topics
      const topics = [
        'v1/FY-Fab/erp/state/order-registry',
        'v1/FY-Fab/plm/state/product-master-+',
        'v1/FY-Fab/cold/+/state/current-job',
        'v1/FY-Fab/cold/+/state/current-mold',
        'v1/FY-Fab/cold/+/state/batch-status',
        'v1/FY-Fab/cold/+/metrics/+',
        'v1/FY-Fab/sheet/+/state/current-job',
        'v1/FY-Fab/sheet/+/state/clean-status',
        'v1/FY-Fab/sheet/+/metrics/+',
        'v1/FY-Fab/warehouse/state/inventory-+',
        'v1/FY-Fab/tooling/state/mold-+',
        'v1/FY-Fab/sched/state/plan-draft',
        'v1/FY-Fab/sched/state/queue-snapshot'
      ];

      topics.forEach(topic => {
        subscribe(topic, 0);
      });
    } else if (state.status === 'error') {
      console.error('MQTT Connection error:', state.error);
    }
  }, [state.status, state.error, subscribe]);

  // Process incoming messages
  useEffect(() => {
    if (state.last) {
      const { topic, payload, ts } = state.last;

      // Add to message feed
      setMessages(prev => [{ topic, payload, ts }, ...prev].slice(0, 50));
      messageCount.current++;

      // Parse payload
      let data: any = null;
      try {
        data = JSON.parse(payload);
      } catch {
        data = payload;
      }

      // Process based on topic pattern
      if (topic.includes('/state/current-job')) {
        const parts = topic.split('/');
        const stationId = parts[parts.length - 3].toUpperCase();

        setEquipment(prev => {
          const updated = new Map(prev);
          updated.set(stationId, {
            stationId,
            status: data.status || 'idle',
            currentJob: data.job_id,
            batchQty: data.batch_qty,
            lastUpdate: ts
          });
          return updated;
        });
      } else if (topic.includes('/state/batch-status')) {
        const parts = topic.split('/');
        const stationId = parts[parts.length - 3].toUpperCase();

        setEquipment(prev => {
          const updated = new Map(prev);
          const existing = updated.get(stationId) || { stationId, lastUpdate: ts };
          updated.set(stationId, {
            ...existing,
            status: data.status || 'idle',
            currentJob: data.job_id,
            lastUpdate: ts
          });
          return updated;
        });
      } else if (topic.includes('/warehouse/state/inventory-')) {
        if (data.material_id) {
          setMaterials(prev => {
            const updated = new Map(prev);
            updated.set(data.material_id, {
              materialId: data.material_id,
              name: data.name || data.material_id,
              type: data.type || 'unknown',
              onhandKg: data.onhand_kg || 0,
              allocatedKg: data.allocated_kg || 0
            });
            return updated;
          });
        }
      } else if (topic.includes('/sched/state/plan-draft')) {
        if (data.job_id) {
          setJobs(prev => {
            const filtered = prev.filter(j => j.jobId !== data.job_id);
            return [...filtered, {
              jobId: data.job_id,
              orderId: data.order_id || '',
              productId: data.product_id || '',
              targetStation: data.target_station || '',
              estStartTime: data.est_start_ts,
              estEndTime: data.est_end_ts,
              batchQty: data.batch_qty || 0
            }].slice(0, 10);
          });
        }
      } else if (topic.includes('/state/current-mold')) {
        const parts = topic.split('/');
        const stationId = parts[parts.length - 3].toUpperCase();

        // Check mold life and generate alert if needed
        if (data.life_used_cycles && data.life_used_cycles > 10000) {
          const alertId = `mold-${stationId}-${Date.now()}`;
          setAlerts(prev => [{
            id: alertId,
            severity: 'warning',
            timestamp: ts,
            station: stationId,
            message: `Mold ${data.mold_id} life at ${data.life_used_cycles} cycles`,
            acknowledged: false
          }, ...prev].slice(0, 20));
        }
      } else if (topic.includes('/sched/state/queue-snapshot')) {
        // Update metrics
        setMetrics(prev => ({
          ...prev,
          activeJobs: (data.running_jobs || 0) + (data.queued_jobs || 0)
        }));
      }
    }
  }, [state.last]);

  // Calculate metrics
  useEffect(() => {
    const runningCount = Array.from(equipment.values()).filter(e => e.status === 'running').length;
    const totalCount = equipment.size || 1;

    setMetrics(prev => ({
      ...prev,
      oee: Math.round((runningCount / totalCount) * 100),
      productionRate: messageCount.current > 0 ? Math.round(messageCount.current / 10) : 0,
      qualityRate: 95 // Would be calculated from actual quality data
    }));
  }, [equipment]);

  const handleDispatchJob = () => {
    if (selectedStation && jobId) {
      const topic = `v1/FY-Fab/cold/${selectedStation}/action/dispatch-task`;
      const payload = JSON.stringify({
        job_id: jobId,
        order_id: `PO-${Date.now()}`,
        product_id: 'P-M6',
        step_code: 'COLD',
        batch_qty: parseInt(batchQty) || 1000
      });
      publish(topic, payload);

      // Clear form
      setJobId('');
      setBatchQty('');
    }
  };

  const handleStartJob = () => {
    if (selectedStation && jobId) {
      const topic = `v1/FY-Fab/cold/${selectedStation}/action/start-task`;
      const payload = JSON.stringify({
        job_id: jobId,
        operator_group: 'OP_COLD',
        expect_minutes: 30
      });
      publish(topic, payload);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-primary text-primary-foreground';
      case 'idle': return 'bg-muted text-muted-foreground';
      case 'queued': return 'bg-secondary text-secondary-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background">



      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-12 gap-4">
          {/* KPI Cards */}
          <div className="col-span-12 grid grid-cols-4 gap-4 h-[120px]">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeJobs}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Activity className="h-3 w-3 mr-1" />
                  {equipment.size} stations monitored
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">OEE</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.oee}%</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Gauge className="h-3 w-3 mr-1" />
                  Overall efficiency
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Production Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.productionRate}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Factory className="h-3 w-3 mr-1" />
                  units/hour
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quality Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.qualityRate}%</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Package className="h-3 w-3 mr-1" />
                  First pass yield
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Equipment Status Grid */}
          <div className="col-span-8 h-[400px]">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Equipment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {equipment.size === 0 ? (
                    <div className="col-span-4 text-center py-8 text-muted-foreground">
                      No equipment data available
                    </div>
                  ) : (
                    Array.from(equipment.values()).map(eq => (
                      <div key={eq.stationId} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">{eq.stationId}</span>
                          <Badge className={getStatusColor(eq.status)} variant="secondary">
                            {eq.status}
                          </Badge>
                        </div>
                        {eq.currentJob && (
                          <div className="text-xs text-muted-foreground">
                            <div>Job: {eq.currentJob}</div>
                            {eq.batchQty && <div>Batch: {eq.batchQty}</div>}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Alerts */}
          <div className="col-span-4 h-[400px]">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[320px]">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No active alerts
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {alerts.map(alert => (
                        <div key={alert.id} className="border rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            {getSeverityIcon(alert.severity)}
                            <div className="flex-1">
                              <div className="text-sm font-medium">{alert.message}</div>
                              <div className="text-xs text-muted-foreground">
                                {alert.station && `Station: ${alert.station} | `}
                                {new Date(alert.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Production Schedule & Materials */}
          <div className="col-span-6 h-[350px]">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Production Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[270px]">
                  {jobs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No scheduled jobs
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {jobs.map(job => (
                        <div key={job.jobId} className="border rounded p-2">
                          <div className="flex justify-between">
                            <span className="font-medium text-sm">{job.jobId}</span>
                            <Badge variant="outline">{job.targetStation}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Product: {job.productId} | Qty: {job.batchQty}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-6 h-[350px]">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Material & Tooling Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="materials" className="h-[270px]">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="materials">Materials</TabsTrigger>
                    <TabsTrigger value="molds">Molds</TabsTrigger>
                    <TabsTrigger value="changeover">Changeover</TabsTrigger>
                  </TabsList>
                  <TabsContent value="materials" className="h-[220px]">
                    <ScrollArea className="h-full">
                      {materials.size === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No material data available
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {Array.from(materials.values()).map(mat => (
                            <div key={mat.materialId} className="flex justify-between items-center">
                              <div>
                                <div className="text-sm font-medium">{mat.name}</div>
                                <div className="text-xs text-muted-foreground">{mat.materialId}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm">{mat.onhandKg} kg</div>
                                <div className="text-xs text-muted-foreground">
                                  Allocated: {mat.allocatedKg} kg
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="molds" className="h-[220px]">
                    <div className="text-center py-8 text-muted-foreground">
                      No mold data available
                    </div>
                  </TabsContent>
                  <TabsContent value="changeover" className="h-[220px]">
                    <div className="text-center py-8 text-muted-foreground">
                      No changeover data available
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Control Actions */}
          <div className="col-span-8 h-[200px]">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Control Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="dispatch">
                  <TabsList>
                    <TabsTrigger value="dispatch">Dispatch</TabsTrigger>
                    <TabsTrigger value="control">Start/Stop</TabsTrigger>
                    <TabsTrigger value="changeover">Changeover</TabsTrigger>
                  </TabsList>
                  <TabsContent value="dispatch" className="space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <Label htmlFor="station">Station</Label>
                        <Select value={selectedStation} onValueChange={setSelectedStation}>
                          <SelectTrigger id="station">
                            <SelectValue placeholder="Select station" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CH01">CH01</SelectItem>
                            <SelectItem value="CH02">CH02</SelectItem>
                            <SelectItem value="TR01">TR01</SelectItem>
                            <SelectItem value="TR02">TR02</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="jobId">Job ID</Label>
                        <Input
                          id="jobId"
                          value={jobId}
                          onChange={(e) => setJobId(e.target.value)}
                          placeholder="JOB-001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="batchQty">Batch Qty</Label>
                        <Input
                          id="batchQty"
                          value={batchQty}
                          onChange={(e) => setBatchQty(e.target.value)}
                          placeholder="1000"
                          type="number"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleDispatchJob} className="w-full">
                          <Send className="h-4 w-4 mr-2" />
                          Dispatch
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="control" className="space-y-3">
                    <div className="flex gap-3">
                      <Button onClick={handleStartJob} variant="default">
                        <Play className="h-4 w-4 mr-2" />
                        Start Job
                      </Button>
                      <Button variant="destructive">
                        <Square className="h-4 w-4 mr-2" />
                        Stop Job
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="changeover">
                    <Button>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Initiate Changeover
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Message Feed */}
          <div className="col-span-4 h-[200px]">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Message Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[140px]">
                  {messages.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No messages received
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {messages.map((msg, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="font-mono text-muted-foreground truncate">
                            {msg.topic}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <footer className="h-8 border-t flex items-center justify-between px-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>MQTT: {state.status}</span>
          <Separator orientation="vertical" className="h-4" />
          <span>{messages.length} messages</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Last update: {new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
}
