import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs-extra';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

export const config = {
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  mqtt: {
    brokerUrl: process.env.MQTT_BROKER_URL || '',
    username: process.env.MQTT_USERNAME || '',
    password: process.env.MQTT_PASSWORD || '',
    discoveryDurationMs: (() => {
      const raw = Number.parseInt(process.env.MQTT_DISCOVERY_MS ?? '', 10);
      return Number.isFinite(raw) && raw > 0 ? raw : 5000;
    })(),
    topicPatterns: process.env.MQTT_TOPIC_PATTERNS
      ? process.env.MQTT_TOPIC_PATTERNS.split(',').map(p => p.trim()).filter(Boolean)
      : undefined,
  },
  paths: {
    root: rootDir,
    templates: process.env.TEMPLATE_DIR || join(rootDir, 'template'),
    artifacts: join(rootDir, 'artifacts'),
    apps: join(rootDir, 'apps'),
  },
};

export async function validateConfig(): Promise<void> {
  if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is required. Please set it in .env file');
  }

  if (config.openaiApiKey === 'YOUR_OPENAI_API_KEY_HERE' || !config.openaiApiKey.startsWith('sk-')) {
    throw new Error(`Invalid OPENAI_API_KEY detected.
Please replace the placeholder with your actual OpenAI API key.
Get one at: https://platform.openai.com/api-keys`);
  }

  await fs.ensureDir(config.paths.artifacts);
  await fs.ensureDir(config.paths.apps);
}

export function hasMqttConfig(): boolean {
  return !!config.mqtt.brokerUrl;
}
