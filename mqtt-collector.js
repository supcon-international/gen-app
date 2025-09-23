const mqtt = require('mqtt');

const BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';
const SAMPLE_DURATION = 45000; // 45 seconds sampling

console.log('Connecting to MQTT broker...');
const client = mqtt.connect(BROKER_URL);

const collectedTopics = new Map();
const startTime = Date.now();

client.on('connect', () => {
  console.log('Connected to broker');
  console.log('Subscribing to all topics (#) for data collection...');
  client.subscribe('#', { qos: 0 }, (err) => {
    if (err) {
      console.error('Subscription error:', err);
    } else {
      console.log(`Collecting data for ${SAMPLE_DURATION/1000} seconds...`);
    }
  });
});

client.on('message', (topic, message) => {
  // Filter to FY-Fab namespace
  if (!topic.startsWith('v1/FY-Fab/')) return;

  try {
    const payload = message.toString();
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payload);
    } catch {
      parsedPayload = payload;
    }

    if (!collectedTopics.has(topic)) {
      collectedTopics.set(topic, {
        count: 0,
        samples: [],
        firstSeen: new Date().toISOString()
      });
    }

    const topicData = collectedTopics.get(topic);
    topicData.count++;

    // Keep max 3 samples per topic
    if (topicData.samples.length < 3) {
      topicData.samples.push({
        timestamp: new Date().toISOString(),
        payload: parsedPayload
      });
    }
  } catch (err) {
    console.error(`Error processing message from ${topic}:`, err.message);
  }
});

client.on('error', (err) => {
  console.error('MQTT error:', err);
});

// Stop collection after duration
setTimeout(() => {
  console.log('\n=== Data Collection Complete ===\n');
  console.log(`Collected ${collectedTopics.size} unique topics:\n`);

  const results = [];
  for (const [topic, data] of collectedTopics.entries()) {
    results.push({
      topic,
      messageCount: data.count,
      firstSeen: data.firstSeen,
      samples: data.samples
    });
  }

  // Sort by message count
  results.sort((a, b) => b.messageCount - a.messageCount);

  results.forEach(item => {
    console.log(`Topic: ${item.topic}`);
    console.log(`  Messages: ${item.messageCount}`);
    if (item.samples.length > 0) {
      console.log(`  Sample payload:`, JSON.stringify(item.samples[0].payload, null, 2));
    }
    console.log('');
  });

  // Save to file
  const fs = require('fs');
  fs.writeFileSync('mqtt-collection.json', JSON.stringify(results, null, 2));
  console.log('Results saved to mqtt-collection.json');

  client.end();
  process.exit(0);
}, SAMPLE_DURATION);