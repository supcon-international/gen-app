import { useEffect, useState, useCallback, useRef } from 'react';
import mqtt, { MqttClient } from 'mqtt';

export interface MqttOptions {
  brokerUrl: string;
  options?: mqtt.IClientOptions;
}

export interface MqttMessage {
  topic: string;
  message: string;
  timestamp: Date;
}

export const useMqtt = ({ brokerUrl, options }: MqttOptions) => {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MqttMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<MqttClient | null>(null);

  useEffect(() => {
    const mqttClient = mqtt.connect(brokerUrl, {
      ...options,
      reconnectPeriod: 1000,
    });

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      setIsConnected(true);
      setError(null);
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    mqttClient.on('close', () => {
      console.log('MQTT connection closed');
      setIsConnected(false);
    });

    mqttClient.on('message', (topic, payload) => {
      const message = payload.toString();
      const newMessage: MqttMessage = {
        topic,
        message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    clientRef.current = mqttClient;
    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, [brokerUrl, options]);

  const subscribe = useCallback(
    (topic: string, callback?: (message: MqttMessage) => void) => {
      if (!client || !isConnected) {
        console.warn('MQTT client is not connected');
        return;
      }

      client.subscribe(topic, (err) => {
        if (err) {
          console.error('Subscribe error:', err);
          setError(err.message);
        } else {
          console.log(`Subscribed to topic: ${topic}`);
        }
      });

      if (callback) {
        const handleMessage = (receivedTopic: string, payload: Buffer) => {
          if (receivedTopic === topic) {
            callback({
              topic: receivedTopic,
              message: payload.toString(),
              timestamp: new Date(),
            });
          }
        };
        client.on('message', handleMessage);
      }
    },
    [client, isConnected]
  );

  const unsubscribe = useCallback(
    (topic: string) => {
      if (!client || !isConnected) {
        console.warn('MQTT client is not connected');
        return;
      }

      client.unsubscribe(topic, (err) => {
        if (err) {
          console.error('Unsubscribe error:', err);
          setError(err.message);
        } else {
          console.log(`Unsubscribed from topic: ${topic}`);
        }
      });
    },
    [client, isConnected]
  );

  const publish = useCallback(
    (topic: string, message: string, qos: 0 | 1 | 2 = 0) => {
      if (!client || !isConnected) {
        console.warn('MQTT client is not connected');
        return;
      }

      client.publish(topic, message, { qos }, (err) => {
        if (err) {
          console.error('Publish error:', err);
          setError(err.message);
        } else {
          console.log(`Published to topic: ${topic}`);
        }
      });
    },
    [client, isConnected]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    client,
    isConnected,
    messages,
    error,
    subscribe,
    unsubscribe,
    publish,
    clearMessages,
  };
};