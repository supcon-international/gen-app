import fs from 'fs';
import path from 'path';

export interface UNSTopic {
  path: string;
  type: 'state' | 'action' | 'metrics';
  template: any;
  estMps?: number;
  description: string;
}

export interface UNSMapping {
  version: string;
  generatedAt: string;
  source: string;
  topics: {
    states: UNSTopic[];
    actions: UNSTopic[];
    metrics: UNSTopic[];
  };
  categories: {
    orders: string[];
    products: string[];
    inventory: string[];
    production: string[];
    molds: string[];
    scheduling: string[];
    workforce: string[];
  };
  eventMappings: any[];
  businessRules: any[];
  stations: string[];
}

export async function generateMapping(options: any): Promise<UNSMapping> {
  const unsPath = options.unsPath || './uns/uns.json';
  const outputPath = options.output || './artifacts/uns_mapping.md';

  console.log('📖 Reading UNS definition from:', unsPath);

  // Read UNS definition
  const unsData = JSON.parse(fs.readFileSync(unsPath, 'utf-8'));

  // Categorize topics
  const mapping: UNSMapping = {
    version: unsData.version || 'v1',
    generatedAt: new Date().toISOString(),
    source: unsPath,
    topics: {
      states: [],
      actions: [],
      metrics: []
    },
    categories: {
      orders: [],
      products: [],
      inventory: [],
      production: [],
      molds: [],
      scheduling: [],
      workforce: []
    },
    eventMappings: [],
    businessRules: [],
    stations: []
  };

  // Extract stations from topics
  const stationSet = new Set<string>();

  // Process topics
  unsData.topics?.forEach((topic: UNSTopic) => {
    // Categorize by type
    switch (topic.type) {
      case 'state':
        mapping.topics.states.push(topic);
        break;
      case 'action':
        mapping.topics.actions.push(topic);
        break;
      case 'metrics':
        mapping.topics.metrics.push(topic);
        break;
    }

    // Extract station names
    const pathParts = topic.path.split('/');
    if (pathParts.length >= 4) {
      const possibleStation = pathParts[3];
      // Check if it looks like a station ID (e.g., CH01, TR02, LASER01)
      if (/^[A-Z]+\d+$/.test(possibleStation)) {
        stationSet.add(possibleStation);
      }
    }

    // Categorize by business domain based on actual UNS data
    const topicPath = topic.path.toLowerCase();

    // Orders (ERP)
    if (topicPath.includes('erp') || topicPath.includes('order-registry')) {
      mapping.categories.orders.push(topic.path);
    }

    // Products (PLM)
    if (topicPath.includes('plm') || topicPath.includes('product-master')) {
      mapping.categories.products.push(topic.path);
    }

    // Inventory (Warehouse)
    if (topicPath.includes('warehouse') || topicPath.includes('inventory')) {
      mapping.categories.inventory.push(topic.path);
    }

    // Production (Station operations)
    if (topicPath.includes('current-job') ||
        topicPath.includes('dispatch-task') ||
        topicPath.includes('start-task') ||
        topicPath.includes('complete-task') ||
        topicPath.includes('cycle-ms') ||
        topicPath.includes('good-count')) {
      mapping.categories.production.push(topic.path);
    }

    // Molds and Tooling
    if (topicPath.includes('mold') ||
        topicPath.includes('changeover') ||
        topicPath.includes('tooling')) {
      mapping.categories.molds.push(topic.path);
    }

    // Scheduling
    if (topicPath.includes('sched') ||
        topicPath.includes('plan') ||
        topicPath.includes('queue')) {
      mapping.categories.scheduling.push(topic.path);
    }

    // Workforce
    if (topicPath.includes('workforce') ||
        topicPath.includes('workgroup') ||
        topicPath.includes('operator')) {
      mapping.categories.workforce.push(topic.path);
    }
  });

  mapping.stations = Array.from(stationSet).sort();

  // Generate event mappings based on actual topics
  mapping.eventMappings = generateEventMappings(mapping);

  // Generate business rules based on actual categories
  mapping.businessRules = generateBusinessRules(mapping);

  // Save mapping to file
  const mappingContent = generateMappingMarkdown(mapping);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, mappingContent);

  // Also save as JSON for programmatic use
  const jsonPath = outputPath.replace('.md', '.json');
  fs.writeFileSync(jsonPath, JSON.stringify(mapping, null, 2));

  console.log('✅ UNS mapping generated:', outputPath);
  console.log('📊 Found:', {
    states: mapping.topics.states.length,
    actions: mapping.topics.actions.length,
    metrics: mapping.topics.metrics.length,
    stations: mapping.stations.length
  });

  return mapping;
}

function generateEventMappings(mapping: UNSMapping): any[] {
  const mappings: any[] = [];

  // Order events
  mapping.categories.orders.forEach(topic => {
    mappings.push({
      topic,
      event: 'ORDER_UPDATE',
      description: 'ERP订单更新',
      conditions: [
        { field: 'priority', operator: '>', value: 80, action: 'HIGH_PRIORITY_ALERT' },
        { field: 'priority', operator: '>', value: 90, action: 'CRITICAL_ORDER' }
      ]
    });
  });

  // Inventory events
  mapping.categories.inventory.forEach(topic => {
    if (topic.includes('inventory')) {
      const materialId = topic.split('-').pop();
      mappings.push({
        topic,
        event: 'INVENTORY_UPDATE',
        description: `库存更新 - ${materialId}`,
        conditions: [
          { field: 'onhand_kg - allocated_kg', operator: '<', value: 500, action: 'LOW_INVENTORY_WARNING' },
          { field: 'onhand_kg - allocated_kg', operator: '<', value: 100, action: 'CRITICAL_INVENTORY_ALERT' }
        ]
      });
    }
  });

  // Mold lifecycle events
  mapping.topics.states
    .filter(t => t.path.includes('current-mold'))
    .forEach(topic => {
      mappings.push({
        topic: topic.path,
        event: 'MOLD_STATUS',
        description: '模具状态监控',
        conditions: [
          { field: 'life_used_cycles', operator: '>', value: 10000, action: 'MAINTENANCE_NEEDED' },
          { field: 'life_used_cycles', operator: '>', value: 15000, action: 'REPLACEMENT_REQUIRED' }
        ]
      });
    });

  // Production job events
  mapping.topics.states
    .filter(t => t.path.includes('current-job'))
    .forEach(topic => {
      mappings.push({
        topic: topic.path,
        event: 'JOB_STATUS',
        description: '生产任务状态',
        conditions: [
          { field: 'status', operator: '===', value: 'error', action: 'JOB_ERROR_ALERT' },
          { field: 'status', operator: '===', value: 'queued', action: 'JOB_QUEUED' }
        ]
      });
    });

  // Queue congestion events
  mapping.topics.states
    .filter(t => t.path.includes('queue-snapshot'))
    .forEach(topic => {
      mappings.push({
        topic: topic.path,
        event: 'QUEUE_STATUS',
        description: '队列状态监控',
        conditions: [
          { field: 'queued_jobs', operator: '>', value: 30, action: 'QUEUE_CONGESTION_WARNING' },
          { field: 'queued_jobs', operator: '>', value: 50, action: 'QUEUE_CRITICAL' }
        ]
      });
    });

  return mappings;
}

function generateBusinessRules(mapping: UNSMapping): any[] {
  const rules = [];

  // Rule: Auto-schedule high priority orders
  if (mapping.categories.orders.length > 0) {
    rules.push({
      id: 'auto-schedule-priority',
      name: '高优先级订单自动调度',
      description: '优先级大于80的订单自动推送至优先队列',
      trigger: 'ORDER_UPDATE && priority > 80',
      action: 'PUSH_TO_PRIORITY_QUEUE',
      topics: mapping.categories.orders
    });
  }

  // Rule: Inventory auto-replenishment
  if (mapping.categories.inventory.length > 0) {
    rules.push({
      id: 'auto-replenish',
      name: '库存自动补货',
      description: '可用库存低于100kg时自动创建采购订单',
      trigger: 'INVENTORY_UPDATE && (onhand_kg - allocated_kg) < 100',
      action: 'CREATE_PURCHASE_ORDER',
      topics: mapping.categories.inventory
    });
  }

  // Rule: Mold lifecycle management
  if (mapping.categories.molds.length > 0) {
    rules.push({
      id: 'mold-lifecycle',
      name: '模具生命周期管理',
      description: '模具使用超过15000次自动停机更换',
      trigger: 'MOLD_STATUS && life_used_cycles > 15000',
      action: 'STOP_STATION_AND_REPLACE',
      topics: mapping.categories.molds
    });
  }

  // Rule: Production efficiency monitoring
  if (mapping.categories.production.length > 0) {
    rules.push({
      id: 'efficiency-monitor',
      name: '生产效率监控',
      description: '生产效率低于60%时发出警告',
      trigger: 'PRODUCTION_METRICS && efficiency < 60',
      action: 'EFFICIENCY_WARNING',
      topics: mapping.categories.production
    });
  }

  // Rule: Queue management
  if (mapping.categories.scheduling.length > 0) {
    rules.push({
      id: 'queue-management',
      name: '队列拥堵管理',
      description: '排队任务超过30个时触发调度优化',
      trigger: 'QUEUE_STATUS && queued_jobs > 30',
      action: 'OPTIMIZE_SCHEDULING',
      topics: mapping.categories.scheduling
    });
  }

  return rules;
}

function generateMappingMarkdown(mapping: UNSMapping): string {
  let content = `# UNS Topic Mapping

Generated: ${mapping.generatedAt}
Source: ${mapping.source}
Version: ${mapping.version}

## Summary

- **State Topics**: ${mapping.topics.states.length}
- **Action Topics**: ${mapping.topics.actions.length}
- **Metrics Topics**: ${mapping.topics.metrics.length}
- **Stations Detected**: ${mapping.stations.length}

## Stations

${mapping.stations.map(s => `- ${s}`).join('\n')}

## Topic Categories

### 📦 订单管理 Orders (${mapping.categories.orders.length} topics)
${mapping.categories.orders.slice(0, 5).map(t => `- \`${t}\``).join('\n')}
${mapping.categories.orders.length > 5 ? `... and ${mapping.categories.orders.length - 5} more` : ''}

### 📋 产品主数据 Products (${mapping.categories.products.length} topics)
${mapping.categories.products.slice(0, 5).map(t => `- \`${t}\``).join('\n')}
${mapping.categories.products.length > 5 ? `... and ${mapping.categories.products.length - 5} more` : ''}

### 📊 库存管理 Inventory (${mapping.categories.inventory.length} topics)
${mapping.categories.inventory.slice(0, 5).map(t => `- \`${t}\``).join('\n')}
${mapping.categories.inventory.length > 5 ? `... and ${mapping.categories.inventory.length - 5} more` : ''}

### 🏭 生产执行 Production (${mapping.categories.production.length} topics)
${mapping.categories.production.slice(0, 10).map(t => `- \`${t}\``).join('\n')}
${mapping.categories.production.length > 10 ? `... and ${mapping.categories.production.length - 10} more` : ''}

### 🔧 模具管理 Molds & Tooling (${mapping.categories.molds.length} topics)
${mapping.categories.molds.slice(0, 5).map(t => `- \`${t}\``).join('\n')}
${mapping.categories.molds.length > 5 ? `... and ${mapping.categories.molds.length - 5} more` : ''}

### 📅 生产排程 Scheduling (${mapping.categories.scheduling.length} topics)
${mapping.categories.scheduling.map(t => `- \`${t}\``).join('\n')}

### 👥 人力资源 Workforce (${mapping.categories.workforce.length} topics)
${mapping.categories.workforce.map(t => `- \`${t}\``).join('\n')}

## Event Mappings (${mapping.eventMappings.length})

${mapping.eventMappings.slice(0, 10).map(em => `
### ${em.event}
- **Topic**: \`${em.topic}\`
- **Description**: ${em.description}
- **Conditions**:
${em.conditions?.map((c: any) => `  - ${c.field} ${c.operator} ${c.value} → ${c.action}`).join('\n') || '  None'}
`).join('\n')}

## Business Rules (${mapping.businessRules.length})

${mapping.businessRules.map(rule => `
### ${rule.name}
- **ID**: ${rule.id}
- **Description**: ${rule.description}
- **Trigger**: \`${rule.trigger}\`
- **Action**: ${rule.action}
- **Applied to**: ${rule.topics.length} topics
`).join('\n')}

## MQTT Subscription Topics

\`\`\`javascript
// State topics for monitoring
const stateTopics = [
${mapping.topics.states.slice(0, 20).map(t => `  '${t.path}',`).join('\n')}
${mapping.topics.states.length > 20 ? `  // ... and ${mapping.topics.states.length - 20} more` : ''}
];

// Action topics for commands
const actionTopics = [
${mapping.topics.actions.slice(0, 10).map(t => `  '${t.path}',`).join('\n')}
${mapping.topics.actions.length > 10 ? `  // ... and ${mapping.topics.actions.length - 10} more` : ''}
];

// Metrics topics for KPIs
const metricsTopics = [
${mapping.topics.metrics.map(t => `  '${t.path}',`).join('\n')}
];
\`\`\`

## Usage Example

\`\`\`typescript
// Subscribe to all state topics for monitoring
stateTopics.forEach(topic => {
  mqttClient.subscribe(topic, (err) => {
    if (!err) {
      console.log(\`Subscribed to \${topic}\`);
    }
  });
});

// Publish actions
mqttClient.publish('v1/FY-Fab/cold/CH01/action/dispatch-task', JSON.stringify({
  job_id: 'JOB-001',
  product_id: 'P-M6',
  batch_qty: 2000
}));
\`\`\`
`;

  return content;
}