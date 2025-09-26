import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Plus, Edit, Trash2, Save, AlertTriangle, CheckCircle,
  Search, Filter, RefreshCw, Loader2, ChevronRight,
  Package, Layers, Clock, Settings, AlertCircle, X, ArrowRight
} from 'lucide-react';

// Types based on product_config_spec and uns.json
interface ProductMaster {
  op: 'upsert' | 'delete';
  product_id: string;
  name: string;
  material_type: 'wire' | 'sheet';
  route_v: number;
  route_step_1?: string;
  route_step_2?: string;
  route_step_3?: string;
  route_step_4?: string;
  default_station_1?: string;
  default_station_2?: string;
  default_station_3?: string;
  default_station_4?: string;
  mold_need_step_1?: string;
  mold_need_step_2?: string;
  mold_need_step_3?: string;
  mold_need_step_4?: string;
  min_batch: number;
  batch_time_min_step_1?: number;
  batch_time_min_step_2?: number;
  batch_time_min_step_3?: number;
  batch_time_min_step_4?: number;
}

interface RouteStep {
  sequence: number;
  step_code: string;
  default_station: string;
  required_mold?: string;
  batch_time_min: number;
}

interface MoldInfo {
  mold_id: string;
  type: string;
  compatible_products: string[];
}

interface ChangeoverMatrix {
  function: string;
  stations: string;
  matrix: Record<string, Record<string, number>>;
}

// Available processes and stations from uns.json
const WIRE_PROCESSES = ['CUTWIRE', 'COLD', 'THREAD', 'HT'];
const SHEET_PROCESSES = ['LASER', 'BEND', 'COAT', 'ASSY'];

const STATIONS = {
  CUTWIRE: ['CUT01'],
  COLD: ['CH01', 'CH02'],
  THREAD: ['TR01', 'TR02'],
  HT: ['HT01'],
  LASER: ['LASER01'],
  BEND: ['BEND01'],
  COAT: ['COAT01'],
  ASSY: ['ASSY01', 'ASSY02']
};

const AVAILABLE_MOLDS = [
  'MOLD_M5', 'MOLD_M6', 'MOLD_M8', 'MOLD_FLANGE_M6',
  'ROLL_STD', 'BENDING_90', 'BENDING_45'
];

const ProductConfiguration = () => {
  // State
  const [products, setProducts] = useState<Map<string, ProductMaster>>(new Map());
  const [molds, setMolds] = useState<Map<string, MoldInfo>>(new Map());
  const [changeoverMatrices, setChangeoverMatrices] = useState<Map<string, ChangeoverMatrix>>(new Map());

  // UI State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductMaster | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [editStep, setEditStep] = useState(0); // 0: Basic, 1: Route, 2: Parameters, 3: Review

  // Form State
  const [formData, setFormData] = useState<ProductMaster>({
    op: 'upsert',
    product_id: '',
    name: '',
    material_type: 'sheet',
    route_v: 1,
    min_batch: 100
  });
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMaterialType, setFilterMaterialType] = useState<'all' | 'wire' | 'sheet'>('all');

  // Loading State
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // MQTT Simulation - Initialize connection
  useEffect(() => {
    console.log('[MQTT] 🔌 Connecting to broker: broker.hivemq.com:1883');
    console.log('[MQTT] Topic prefix: v1/FY-Fab/#');

    setTimeout(() => {
      setIsConnected(true);
      console.log('[MQTT] ✅ Connected successfully');

      // Subscribe to product master topics
      console.log('[MQTT] 📥 Subscribing to: v1/FY-Fab/plm/state/product-master-*');
      console.log('[MQTT] 📥 Subscribing to: v1/FY-Fab/tooling/state/mold-*');
      console.log('[MQTT] 📥 Subscribing to: v1/FY-Fab/tooling/state/changeover-matrix-*');

      loadInitialData();
    }, 1000);

    return () => {
      console.log('[MQTT] 🔌 Disconnecting from broker');
      setIsConnected(false);
    };
  }, []);

  // Load initial product data from UNS
  const loadInitialData = () => {
    setIsLoading(true);

    // Simulate loading product master data
    const initialProducts = new Map<string, ProductMaster>();

    // Wire products from uns.json
    initialProducts.set('P-M5', {
      op: 'upsert',
      product_id: 'P-M5',
      name: 'M5 螺丝',
      material_type: 'wire',
      route_v: 1,
      route_step_1: 'CUTWIRE',
      route_step_2: 'COLD',
      route_step_3: 'THREAD',
      route_step_4: 'HT',
      default_station_1: 'CUT01',
      default_station_2: 'CH01',
      default_station_3: 'TR01',
      default_station_4: 'HT01',
      mold_need_step_2: 'MOLD_M5',
      mold_need_step_3: 'ROLL_STD',
      min_batch: 2000,
      batch_time_min_step_1: 33.3,
      batch_time_min_step_2: 40,
      batch_time_min_step_3: 50,
      batch_time_min_step_4: 166.7
    });

    initialProducts.set('P-M6', {
      op: 'upsert',
      product_id: 'P-M6',
      name: 'M6 螺丝',
      material_type: 'wire',
      route_v: 1,
      route_step_1: 'CUTWIRE',
      route_step_2: 'COLD',
      route_step_3: 'THREAD',
      route_step_4: 'HT',
      default_station_1: 'CUT01',
      default_station_2: 'CH02',
      default_station_3: 'TR02',
      default_station_4: 'HT01',
      mold_need_step_2: 'MOLD_M6',
      mold_need_step_3: 'ROLL_STD',
      min_batch: 2000,
      batch_time_min_step_1: 33.3,
      batch_time_min_step_2: 40,
      batch_time_min_step_3: 50,
      batch_time_min_step_4: 166.7
    });

    initialProducts.set('P-M8', {
      op: 'upsert',
      product_id: 'P-M8',
      name: 'M8 螺栓',
      material_type: 'wire',
      route_v: 1,
      route_step_1: 'CUTWIRE',
      route_step_2: 'COLD',
      route_step_3: 'THREAD',
      route_step_4: 'HT',
      default_station_1: 'CUT01',
      default_station_2: 'CH01',
      default_station_3: 'TR01',
      default_station_4: 'HT01',
      mold_need_step_2: 'MOLD_M8',
      mold_need_step_3: 'ROLL_STD',
      min_batch: 5000,
      batch_time_min_step_1: 83.3,
      batch_time_min_step_2: 100,
      batch_time_min_step_3: 125,
      batch_time_min_step_4: 416.7
    });

    initialProducts.set('P-FL6', {
      op: 'upsert',
      product_id: 'P-FL6',
      name: 'M6 法兰螺栓',
      material_type: 'wire',
      route_v: 1,
      route_step_1: 'CUTWIRE',
      route_step_2: 'COLD',
      route_step_3: 'THREAD',
      route_step_4: 'HT',
      default_station_1: 'CUT01',
      default_station_2: 'CH02',
      default_station_3: 'TR02',
      default_station_4: 'HT01',
      mold_need_step_2: 'MOLD_FLANGE_M6',
      mold_need_step_3: 'ROLL_STD',
      min_batch: 5000,
      batch_time_min_step_1: 83.3,
      batch_time_min_step_2: 100,
      batch_time_min_step_3: 125,
      batch_time_min_step_4: 416.7
    });

    // Sheet products from uns.json
    initialProducts.set('P-PANEL1', {
      op: 'upsert',
      product_id: 'P-PANEL1',
      name: '钣金面板 A',
      material_type: 'sheet',
      route_v: 1,
      route_step_1: 'LASER',
      route_step_2: 'BEND',
      route_step_3: 'COAT',
      route_step_4: 'ASSY',
      default_station_1: 'LASER01',
      default_station_2: 'BEND01',
      default_station_3: 'COAT01',
      default_station_4: 'ASSY01',
      min_batch: 5,
      batch_time_min_step_1: 10,
      batch_time_min_step_2: 7.5,
      batch_time_min_step_3: 15,
      batch_time_min_step_4: 10
    });

    initialProducts.set('P-PANEL2', {
      op: 'upsert',
      product_id: 'P-PANEL2',
      name: '钣金面板 B',
      material_type: 'sheet',
      route_v: 1,
      route_step_1: 'LASER',
      route_step_2: 'BEND',
      route_step_3: 'COAT',
      route_step_4: 'ASSY',
      default_station_1: 'LASER01',
      default_station_2: 'BEND01',
      default_station_3: 'COAT01',
      default_station_4: 'ASSY02',
      min_batch: 10,
      batch_time_min_step_1: 22,
      batch_time_min_step_2: 16,
      batch_time_min_step_3: 32,
      batch_time_min_step_4: 22
    });

    setProducts(initialProducts);

    // Load mold data
    const initialMolds = new Map<string, MoldInfo>();
    initialMolds.set('MOLD_M5', { mold_id: 'MOLD_M5', type: 'cold_header', compatible_products: ['P-M5'] });
    initialMolds.set('MOLD_M6', { mold_id: 'MOLD_M6', type: 'cold_header', compatible_products: ['P-M6'] });
    initialMolds.set('MOLD_M8', { mold_id: 'MOLD_M8', type: 'cold_header', compatible_products: ['P-M8'] });
    initialMolds.set('MOLD_FLANGE_M6', { mold_id: 'MOLD_FLANGE_M6', type: 'cold_header', compatible_products: ['P-FL6'] });
    initialMolds.set('ROLL_STD', { mold_id: 'ROLL_STD', type: 'thread_roller', compatible_products: ['P-M5', 'P-M6', 'P-M8', 'P-FL6'] });
    setMolds(initialMolds);

    console.log('[MQTT] 📨 Loaded', initialProducts.size, 'products from UNS');
    setIsLoading(false);
  };

  // Open edit dialog
  const openEditDialog = (product?: ProductMaster) => {
    if (product) {
      // Edit existing product
      setEditingProduct(product);
      setIsNewProduct(false);
      setFormData({ ...product });

      // Convert to route steps array
      const steps: RouteStep[] = [];
      for (let i = 1; i <= 4; i++) {
        const stepCode = product[`route_step_${i}` as keyof ProductMaster] as string;
        if (stepCode) {
          steps.push({
            sequence: i,
            step_code: stepCode,
            default_station: product[`default_station_${i}` as keyof ProductMaster] as string || '',
            required_mold: product[`mold_need_step_${i}` as keyof ProductMaster] as string,
            batch_time_min: product[`batch_time_min_step_${i}` as keyof ProductMaster] as number || 0
          });
        }
      }
      setRouteSteps(steps);
    } else {
      // New product
      setEditingProduct(null);
      setIsNewProduct(true);
      setFormData({
        op: 'upsert',
        product_id: '',
        name: '',
        material_type: 'sheet',
        route_v: 1,
        min_batch: 100
      });
      setRouteSteps([]);
    }

    setEditStep(0);
    setValidationErrors([]);
    setIsEditDialogOpen(true);
  };

  // Validate form - EARS Requirement 2, 4
  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Basic validation
    if (!formData.product_id) {
      errors.push('产品ID是必填项');
    } else if (isNewProduct && products.has(formData.product_id)) {
      errors.push('产品ID已存在');
    }

    if (!formData.name) {
      errors.push('产品名称是必填项');
    }

    if (formData.min_batch <= 0) {
      errors.push('最小批量必须大于0');
    }

    // Route validation - must have at least one step
    if (routeSteps.length === 0) {
      errors.push('必须定义至少一条工艺路线');
    }

    // Check route sequence is unique and continuous
    const sequences = routeSteps.map(s => s.sequence);
    const uniqueSequences = new Set(sequences);
    if (sequences.length !== uniqueSequences.size) {
      errors.push('工序顺序不能重复');
    }

    // Check each step has valid data
    routeSteps.forEach((step, index) => {
      if (!step.step_code) {
        errors.push(`工序 ${index + 1} 的工序代码不能为空`);
      }
      if (!step.default_station) {
        errors.push(`工序 ${index + 1} 的默认工站不能为空`);
      }
      if (step.batch_time_min <= 0) {
        errors.push(`工序 ${index + 1} 的批次时间必须大于0`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Save product - EARS Requirement 4, 5
  const saveProduct = async () => {
    if (!validateForm()) {
      toast.error('请修正表单错误');
      return;
    }

    setIsSaving(true);

    // Convert route steps back to flat structure
    const productData: ProductMaster = { ...formData };
    routeSteps.forEach(step => {
      const idx = step.sequence;
      productData[`route_step_${idx}` as keyof ProductMaster] = step.step_code as any;
      productData[`default_station_${idx}` as keyof ProductMaster] = step.default_station as any;
      if (step.required_mold) {
        productData[`mold_need_step_${idx}` as keyof ProductMaster] = step.required_mold as any;
      }
      productData[`batch_time_min_step_${idx}` as keyof ProductMaster] = step.batch_time_min as any;
    });

    // Publish to UNS
    const topic = `v1/FY-Fab/plm/state/product-master-${productData.product_id}`;
    console.log(`[MQTT] 📤 Publishing to: ${topic}`);
    console.log('[MQTT] Payload:', productData);

    // Simulate save delay
    setTimeout(() => {
      // Update local state
      setProducts(prev => new Map(prev).set(productData.product_id, productData));

      console.log('[MQTT] ✅ Product saved successfully');
      toast.success(`产品 ${productData.product_id} 保存成功`);

      // EARS Requirement 5 - Mark for reschedule assessment
      if (!isNewProduct && editingProduct) {
        const routeChanged = JSON.stringify(routeSteps) !== JSON.stringify(editingProduct);
        if (routeChanged) {
          console.log('[System] ⚠️ Route changed - marking for reschedule assessment');
          toast.info('工艺路线已变更，需要重新评估排产', {
            duration: 5000,
            action: {
              label: '查看',
              onClick: () => console.log('Navigate to scheduling module')
            }
          });
        }
      }

      setIsSaving(false);
      setIsEditDialogOpen(false);
    }, 1000);
  };

  // Delete product
  const deleteProduct = (productId: string) => {
    const topic = `v1/FY-Fab/plm/state/product-master-${productId}`;
    const payload = { op: 'delete', product_id: productId };

    console.log(`[MQTT] 📤 Publishing delete to: ${topic}`);
    console.log('[MQTT] Payload:', payload);

    setProducts(prev => {
      const newProducts = new Map(prev);
      newProducts.delete(productId);
      return newProducts;
    });

    toast.success(`产品 ${productId} 已删除`);
  };

  // Add route step
  const addRouteStep = () => {
    const nextSequence = routeSteps.length + 1;
    if (nextSequence > 4) {
      toast.error('最多支持4道工序');
      return;
    }

    const availableProcesses = formData.material_type === 'wire' ? WIRE_PROCESSES : SHEET_PROCESSES;
    setRouteSteps([...routeSteps, {
      sequence: nextSequence,
      step_code: availableProcesses[nextSequence - 1] || '',
      default_station: '',
      batch_time_min: 0
    }]);
  };

  // Remove route step
  const removeRouteStep = (index: number) => {
    const newSteps = routeSteps.filter((_, i) => i !== index);
    // Resequence
    newSteps.forEach((step, i) => {
      step.sequence = i + 1;
    });
    setRouteSteps(newSteps);
  };

  // Update route step
  const updateRouteStep = (index: number, field: keyof RouteStep, value: any) => {
    const newSteps = [...routeSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setRouteSteps(newSteps);
  };

  // Filter products
  const filteredProducts = Array.from(products.values()).filter(product => {
    if (filterMaterialType !== 'all' && product.material_type !== filterMaterialType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        product.product_id.toLowerCase().includes(query) ||
        product.name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Get route string for display
  const getRouteString = (product: ProductMaster): string => {
    const steps = [];
    for (let i = 1; i <= 4; i++) {
      const step = product[`route_step_${i}` as keyof ProductMaster];
      if (step) steps.push(step);
    }
    return steps.join(' → ');
  };

  // Get total batch time
  const getTotalBatchTime = (product: ProductMaster): number => {
    let total = 0;
    for (let i = 1; i <= 4; i++) {
      const time = product[`batch_time_min_step_${i}` as keyof ProductMaster] as number;
      if (time) total += time;
    }
    return total;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">产品配置管理</h1>
              <p className="text-sm text-muted-foreground mt-1">
                管理产品主数据、工艺路线和加工参数
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? 'UNS 已连接' : 'UNS 断开'}
              </Badge>
              <Button
                onClick={() => loadInitialData()}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Filter Bar */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索产品ID或名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterMaterialType} onValueChange={(v) => setFilterMaterialType(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="材料类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="wire">线材 (Wire)</SelectItem>
                  <SelectItem value="sheet">板材 (Sheet)</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => openEditDialog()}>
                <Plus className="h-4 w-4 mr-1" />
                新建产品
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Table - EARS Requirement 3 */}
        <Card>
          <CardHeader>
            <CardTitle>产品列表</CardTitle>
            <CardDescription>
              共 {filteredProducts.length} 个产品配置
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无产品配置</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>产品ID</TableHead>
                    <TableHead>产品名称</TableHead>
                    <TableHead>材料类型</TableHead>
                    <TableHead>工艺路线</TableHead>
                    <TableHead>最小批量</TableHead>
                    <TableHead>总加工时间</TableHead>
                    <TableHead>版本</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map(product => (
                    <TableRow key={product.product_id}>
                      <TableCell className="font-mono">{product.product_id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.material_type === 'wire' ? '线材' : '板材'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          {getRouteString(product).split(' → ').map((step, idx) => (
                            <div key={idx} className="flex items-center">
                              {idx > 0 && <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />}
                              <Badge variant="secondary" className="text-xs">{step}</Badge>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{product.min_batch.toLocaleString()}</TableCell>
                      <TableCell>{getTotalBatchTime(product).toFixed(1)} 分钟</TableCell>
                      <TableCell>v{product.route_v}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`确定删除产品 ${product.product_id}？`)) {
                                deleteProduct(product.product_id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog - EARS Requirement 1, 2, 4, 6 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isNewProduct ? '新建产品配置' : `编辑产品 ${formData.product_id}`}
            </DialogTitle>
            <DialogDescription>
              定义产品主数据、工艺路线和加工参数
            </DialogDescription>
          </DialogHeader>

          <Tabs value={editStep.toString()} onValueChange={(v) => setEditStep(parseInt(v))} className="flex-1">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="0">基础信息</TabsTrigger>
              <TabsTrigger value="1" disabled={!formData.product_id}>工艺路线</TabsTrigger>
              <TabsTrigger value="2" disabled={routeSteps.length === 0}>工序参数</TabsTrigger>
              <TabsTrigger value="3" disabled={routeSteps.length === 0}>校验与发布</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] mt-4">
              {/* Step 1: Basic Information */}
              <TabsContent value="0" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>产品ID *</Label>
                    <Input
                      value={formData.product_id}
                      onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                      placeholder="如: P-M6"
                      disabled={!isNewProduct}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label>产品名称 *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="如: M6 螺丝"
                    />
                  </div>
                  <div>
                    <Label>材料类型 *</Label>
                    <Select
                      value={formData.material_type}
                      onValueChange={(v) => {
                        setFormData({ ...formData, material_type: v as 'wire' | 'sheet' });
                        setRouteSteps([]); // Reset route when material type changes
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wire">线材 (Wire)</SelectItem>
                        <SelectItem value="sheet">板材 (Sheet)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>最小批量 *</Label>
                    <Input
                      type="number"
                      value={formData.min_batch}
                      onChange={(e) => setFormData({ ...formData, min_batch: parseInt(e.target.value) || 0 })}
                      min="1"
                    />
                  </div>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {formData.material_type === 'wire'
                      ? '线材产品工艺路线: CUTWIRE → COLD → THREAD → HT'
                      : '板材产品工艺路线: LASER → BEND → COAT → ASSY'}
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* Step 2: Route Configuration */}
              <TabsContent value="1" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base">工艺路线配置</Label>
                  <Button
                    size="sm"
                    onClick={addRouteStep}
                    disabled={routeSteps.length >= 4}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    添加工序
                  </Button>
                </div>

                {routeSteps.length === 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      请添加至少一道工序
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {routeSteps.map((step, index) => {
                      const availableProcesses = formData.material_type === 'wire' ? WIRE_PROCESSES : SHEET_PROCESSES;
                      return (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="shrink-0">
                                工序 {step.sequence}
                              </Badge>
                              <Select
                                value={step.step_code}
                                onValueChange={(v) => updateRouteStep(index, 'step_code', v)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="选择工序" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableProcesses.map(process => (
                                    <SelectItem key={process} value={process}>{process}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                              <Select
                                value={step.default_station}
                                onValueChange={(v) => updateRouteStep(index, 'default_station', v)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="默认工站" />
                                </SelectTrigger>
                                <SelectContent>
                                  {step.step_code && STATIONS[step.step_code as keyof typeof STATIONS]?.map(station => (
                                    <SelectItem key={station} value={station}>{station}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeRouteStep(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Step 3: Process Parameters */}
              <TabsContent value="2" className="space-y-4">
                <Label className="text-base">工序参数配置</Label>
                {routeSteps.map((step, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">
                        工序 {step.sequence}: {step.step_code} @ {step.default_station}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">批次加工时间 (分钟) *</Label>
                          <Input
                            type="number"
                            value={step.batch_time_min}
                            onChange={(e) => updateRouteStep(index, 'batch_time_min', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">所需模具 (可选)</Label>
                          <Select
                            value={step.required_mold || 'none'}
                            onValueChange={(v) => updateRouteStep(index, 'required_mold', v === 'none' ? undefined : v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">无</SelectItem>
                              {AVAILABLE_MOLDS.map(mold => {
                                const moldInfo = molds.get(mold);
                                const isCompatible = !moldInfo || moldInfo.compatible_products.length === 0 ||
                                  moldInfo.compatible_products.includes(formData.product_id);
                                return (
                                  <SelectItem
                                    key={mold}
                                    value={mold}
                                    disabled={!isCompatible}
                                  >
                                    {mold} {!isCompatible && '(不兼容)'}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Step 4: Review and Publish */}
              <TabsContent value="3" className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    请检查配置信息，确认无误后点击保存发布到 UNS
                  </AlertDescription>
                </Alert>

                {validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-2">请修正以下错误:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, idx) => (
                          <li key={idx} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">配置摘要</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">产品ID:</span>
                        <span className="ml-2 font-mono">{formData.product_id}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">产品名称:</span>
                        <span className="ml-2">{formData.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">材料类型:</span>
                        <span className="ml-2">{formData.material_type === 'wire' ? '线材' : '板材'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">最小批量:</span>
                        <span className="ml-2">{formData.min_batch}</span>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="text-sm font-medium mb-2">工艺路线</div>
                      <div className="space-y-2">
                        {routeSteps.map((step, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{step.sequence}</Badge>
                            <span>{step.step_code}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{step.default_station}</span>
                            {step.required_mold && (
                              <>
                                <Separator orientation="vertical" className="h-4" />
                                <Badge variant="secondary" className="text-xs">
                                  模具: {step.required_mold}
                                </Badge>
                              </>
                            )}
                            <Separator orientation="vertical" className="h-4" />
                            <span className="text-muted-foreground">
                              {step.batch_time_min} 分钟
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-sm text-muted-foreground">总加工时间: </span>
                        <span className="text-sm font-medium">
                          {routeSteps.reduce((sum, step) => sum + step.batch_time_min, 0).toFixed(1)} 分钟
                        </span>
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        保存后将发布到: v1/FY-Fab/plm/state/product-master-{formData.product_id}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            {editStep > 0 && (
              <Button variant="outline" onClick={() => setEditStep(editStep - 1)}>
                上一步
              </Button>
            )}
            {editStep < 3 ? (
              <Button onClick={() => {
                if (editStep === 0 && !formData.product_id) {
                  toast.error('请填写产品ID');
                  return;
                }
                if (editStep === 1 && routeSteps.length === 0) {
                  toast.error('请配置工艺路线');
                  return;
                }
                setEditStep(editStep + 1);
              }}>
                下一步
              </Button>
            ) : (
              <Button onClick={saveProduct} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    保存并发布
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductConfiguration;