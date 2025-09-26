import mqtt from 'mqtt';
import fs from 'fs-extra';
import path from 'path';
import { config, hasMqttConfig } from '../config.js';
import { log } from '../utils/log.js';
import { z } from 'zod';

export interface UNSData {
  topics: TopicInfo[];
  timestamp: string;
  source: 'uns-definition' | 'mqtt' | 'file';
  liveData?: Map<string, any>;
}

export interface TopicInfo {
  topic: string;
  schema: Record<string, any>;
  sampleData?: any;
  description?: string;
  subscribe?: boolean;
  publish?: boolean;
}

const UNSFileSchema = z.object({
  topics: z.array(z.object({
    topic: z.string(),
    schema: z.record(z.any()),
    sampleData: z.any().optional(),
    description: z.string().optional(),
    subscribe: z.boolean().optional(),
    publish: z.boolean().optional(),
  })),
});

export async function inspectUNS(artifactDir?: string): Promise<UNSData> {
  const artifactsPath = artifactDir || config.paths.artifacts;
  await fs.ensureDir(artifactsPath);

  let unsData: UNSData;

  // Try to read from uns/uns.json
  const unsPath = path.join(config.paths.root, 'uns', 'uns.json');
  if (await fs.pathExists(unsPath)) {
    log.info('Reading UNS definitions from uns/uns.json...');
    unsData = await readFromFile();

    // If MQTT is configured, subscribe to defined topics for live data
    if (hasMqttConfig() && unsData.topics.some(t => t.subscribe)) {
      log.info('Subscribing to MQTT topics for live updates...');
      await subscribeToDefinedTopics(unsData);
      await persistLiveSamples(unsData, artifactDir);
    }
  } else if (hasMqttConfig()) {
    log.info('No uns/uns.json found, discovering from MQTT broker...');
    unsData = await inspectFromMQTT();
    await persistLiveSamples(unsData, artifactDir);
  } else {
    throw new Error('No UNS definition file found. Please ensure uns/uns.json exists.');
  }

  await generateUNSOverview(unsData, artifactDir);
  return unsData;
}


async function subscribeToDefinedTopics(unsData: UNSData): Promise<void> {
  return new Promise((resolve) => {
    const client = mqtt.connect(config.mqtt.brokerUrl, {
      username: config.mqtt.username,
      password: config.mqtt.password,
      reconnectPeriod: 0,
    });

    const liveData = new Map<string, any>();
    let timeout: NodeJS.Timeout;
    const dwellMs = config.mqtt.discoveryDurationMs;

    client.on('connect', () => {
      log.info('Connected to MQTT broker for live updates');

      // Subscribe only to topics marked with subscribe: true
      const subscribeTopics = unsData.topics
        .filter(t => t.subscribe)
        .map(t => t.topic);

      if (subscribeTopics.length === 0) {
        client.end();
        unsData.liveData = new Map();
        resolve();
        return;
      }

      subscribeTopics.forEach(topic => {
        client.subscribe(topic, { qos: 0 }, (err) => {
          if (err) {
            log.warn(`Failed to subscribe to ${topic}: ${err.message}`);
          } else {
            log.info(`Subscribed to ${topic}`);
          }
        });
      });

      // Collect data for configured dwell period
      timeout = setTimeout(() => {
        client.end();
        unsData.liveData = liveData;
        resolve();
      }, dwellMs);
    });

    client.on('message', (topic, payload) => {
      try {
        const data = JSON.parse(payload.toString());
        liveData.set(topic, data);
        log.info(`Received live data for ${topic}`);
      } catch (e) {
        liveData.set(topic, payload.toString());
      }
    });

    client.on('error', (err) => {
      clearTimeout(timeout);
      client.end();
      log.warn(`MQTT connection error: ${err.message}`);
      resolve(); // Don't reject, just continue without live data
    });
  });
}

async function inspectFromMQTT(): Promise<UNSData> {
  return new Promise((resolve, reject) => {
    const client = mqtt.connect(config.mqtt.brokerUrl, {
      username: config.mqtt.username,
      password: config.mqtt.password,
      reconnectPeriod: 0,
    });

    const topics: TopicInfo[] = [];
    const discoveredTopics = new Set<string>();
    let timeout: NodeJS.Timeout;
    const MAX_TOPICS = 10; // Limit to prevent token overflow
    const liveSamples = new Map<string, any>();

    client.on('connect', () => {
      log.info('Connected to MQTT broker');

      // HiveMQ public broker doesn't allow # wildcard, use specific topic patterns
      const defaultPatterns = [
        'enterprise/+/+/+/+',  // Standard UNS pattern
        'test/+',               // Test topics
        'demo/+',               // Demo topics
        '+/status',             // Status topics
        '+/data'                // Data topics
      ];

      const patternSource = config.mqtt.topicPatterns && config.mqtt.topicPatterns.length > 0
        ? config.mqtt.topicPatterns
        : defaultPatterns;

      let subscribeCount = 0;
      let subscribeErrors = 0;

      patternSource.forEach(pattern => {
        client.subscribe(pattern, { qos: 0 }, (err) => {
          subscribeCount++;

          if (err) {
            subscribeErrors++;
            log.warn(`Failed to subscribe to ${pattern}: ${err.message}`);
          } else {
            log.info(`Subscribed to ${pattern}`);
          }

          // After all subscription attempts, start timeout
          if (subscribeCount === patternSource.length) {
            if (subscribeErrors === patternSource.length) {
              client.end();
              reject(new Error('Failed to subscribe to any topics. Using fallback to local file.'));
              return;
            }

            timeout = setTimeout(() => {
              client.end();
              resolve({
                topics: Array.from(topics),
                timestamp: new Date().toISOString(),
                source: 'mqtt',
                liveData: liveSamples,
              });
            }, config.mqtt.discoveryDurationMs);
          }
        });
      });
    });

    client.on('message', (topic, payload) => {
      if (!discoveredTopics.has(topic) && topics.length < MAX_TOPICS) {
        discoveredTopics.add(topic);

        try {
          const data = JSON.parse(payload.toString());
          const schema = inferSchema(data);

          topics.push({
            topic,
            schema,
            sampleData: data,
            description: inferTopicDescription(topic),
            subscribe: true,
            publish: false,
          });
          liveSamples.set(topic, data);
        } catch (e) {
          topics.push({
            topic,
            schema: { type: 'string' },
            sampleData: payload.toString(),
            description: inferTopicDescription(topic),
            subscribe: true,
            publish: false,
          });
          liveSamples.set(topic, payload.toString());
        }

        // Stop listening once we have enough topics
        if (topics.length >= MAX_TOPICS) {
          clearTimeout(timeout);
          client.end();
          resolve({
            topics: Array.from(topics),
            timestamp: new Date().toISOString(),
            source: 'mqtt',
            liveData: liveSamples,
          });
        }
      }
    });

    client.on('error', (err) => {
      clearTimeout(timeout);
      client.end();
      reject(err);
    });
  });
}

async function readFromFile(): Promise<UNSData> {
  // Read from uns/uns.json
  const filePath = path.join(process.cwd(), 'uns', 'uns.json');

  if (!await fs.pathExists(filePath)) {
    throw new Error('No UNS definition file found. Please ensure uns/uns.json exists.');
  }

  const fileContent = await fs.readJSON(filePath);

  // Handle the actual UNS format from uns/uns.json
  if (fileContent.topics && Array.isArray(fileContent.topics)) {
    const topics = fileContent.topics.map((topic: any) => {
      // Convert from UNS format to our internal format
      const isSubscribable = topic.type === 'state' || topic.type === 'metrics';
      const isPublishable = topic.type === 'action';

      return {
        topic: topic.path,
        schema: topic.template || inferSchema(topic.template),
        sampleData: topic.template,
        description: topic.description,
        subscribe: isSubscribable,
        publish: isPublishable
      };
    });

    return {
      topics,
      timestamp: new Date().toISOString(),
      source: 'file',
    };
  }

  // Fallback for old format
  const validated = UNSFileSchema.parse(fileContent);

  return {
    topics: validated.topics,
    timestamp: new Date().toISOString(),
    source: 'file',
  };
}

function inferSchema(data: any): Record<string, any> {
  if (data === null || data === undefined) {
    return { type: 'null' };
  }

  if (Array.isArray(data)) {
    return {
      type: 'array',
      items: data.length > 0 ? inferSchema(data[0]) : { type: 'any' },
    };
  }

  if (typeof data === 'object') {
    const properties: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      properties[key] = inferSchema(value);
    }
    return {
      type: 'object',
      properties,
    };
  }

  if (typeof data === 'number') {
    return { type: 'number' };
  }

  if (typeof data === 'boolean') {
    return { type: 'boolean' };
  }

  if (typeof data === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(data)) {
      return { type: 'string', format: 'date-time' };
    }
    return { type: 'string' };
  }

  return { type: 'any' };
}

function inferTopicDescription(topic: string): string {
  const parts = topic.split('/');
  const lastPart = parts[parts.length - 1];

  const descriptions: Record<string, string> = {
    temperature: 'Temperature sensor data',
    pressure: 'Pressure sensor data',
    humidity: 'Humidity sensor data',
    speed: 'Speed measurement data',
    status: 'Equipment status information',
    alarm: 'Alarm and alert messages',
    production: 'Production metrics',
    quality: 'Quality control data',
    energy: 'Energy consumption data',
  };

  for (const [key, desc] of Object.entries(descriptions)) {
    if (lastPart.toLowerCase().includes(key)) {
      return desc;
    }
  }

  return `Data from ${lastPart}`;
}

async function generateUNSOverview(unsData: UNSData, artifactDir?: string): Promise<void> {
  const baseArtifactDir = artifactDir || config.paths.artifacts;
  const overviewPath = path.join(baseArtifactDir, 'uns_overview.md');

  let content = `# UNS Overview\n\n`;
  content += `Generated: ${unsData.timestamp}\n`;
  content += `Source: ${unsData.source === 'mqtt' ? 'MQTT Broker' : 'UNS Definition File'}\n\n`;

  content += `## Topics Summary\n\n`;
  content += `Total Topics: ${unsData.topics.length}\n`;

  const subscribeCount = unsData.topics.filter(t => t.subscribe).length;
  const publishCount = unsData.topics.filter(t => t.publish).length;

  content += `Subscribe Topics: ${subscribeCount}\n`;
  content += `Publish Topics: ${publishCount}\n\n`;

  if (unsData.liveData && unsData.liveData.size > 0) {
    content += `## Live Data Captured\n\n`;
    content += `Connected to MQTT broker and captured ${unsData.liveData.size} live messages.\n\n`;
  }

  content += `## Topic List\n\n`;
  for (const topic of unsData.topics) {
    content += `### ${topic.topic}\n\n`;
    content += `**Description:** ${topic.description || 'N/A'}\n`;
    content += `**Permissions:** ${topic.subscribe ? 'Subscribe' : ''}${topic.subscribe && topic.publish ? ', ' : ''}${topic.publish ? 'Publish' : ''}\n\n`;

    content += `**Schema:**\n`;
    content += '```json\n';
    content += JSON.stringify(topic.schema, null, 2);
    content += '\n```\n\n';

    // Show live data if available, otherwise show sample data
    const dataToShow = unsData.liveData?.get(topic.topic) || topic.sampleData;
    if (dataToShow) {
      const dataLabel = unsData.liveData?.has(topic.topic) ? 'Live Data' : 'Sample Data';
      content += `**${dataLabel}:**\n`;
      content += '```json\n';
      content += JSON.stringify(dataToShow, null, 2);
      content += '\n```\n\n';
    }
  }

  content += `## Business Context\n\n`;
  content += `The UNS (Unified Namespace) structure follows the ISA-95 hierarchy:\n`;
  content += `- Enterprise: Top-level organization\n`;
  content += `- Site: Physical location\n`;
  content += `- Area: Functional area within site\n`;
  content += `- Line: Production or process line\n`;
  content += `- Cell: Individual equipment or sensor\n\n`;

  content += `This structure enables:\n`;
  content += `- Hierarchical data organization\n`;
  content += `- Context-aware data consumption\n`;
  content += `- Scalable integration patterns\n`;
  content += `- Real-time data flow across systems\n`;

  await fs.writeFile(overviewPath, content, 'utf-8');
  log.success(`UNS overview saved to ${overviewPath}`);
}

async function persistLiveSamples(unsData: UNSData, artifactDir?: string): Promise<void> {
  if (!unsData.liveData || unsData.liveData.size === 0) {
    return;
  }

  const baseArtifactDir = artifactDir || config.paths.artifacts;
  const samplesPath = path.join(baseArtifactDir, 'uns_live_samples.json');
  const samplesObject: Record<string, unknown> = {};

  for (const [topic, payload] of unsData.liveData.entries()) {
    samplesObject[topic] = payload;
  }

  await fs.writeJSON(samplesPath, samplesObject, { spaces: 2 });
  log.success(`Saved live samples to ${samplesPath}`);
}
