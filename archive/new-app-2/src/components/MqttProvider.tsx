import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import mqtt from 'mqtt';

interface MqttContextType {
  client: mqtt.MqttClient | null;
  isConnected: boolean;
  messages: any[];
  subscribe: (topic: string) => void;
  publish: (topic: string, message: any) => void;
}

const MqttContext = createContext<MqttContextType>({
  client: null,
  isConnected: false,
  messages: [],
  subscribe: () => {},
  publish: () => {},
});

export const useMqtt = () => useContext(MqttContext);

export const MqttProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const mqttClient = mqtt.connect('ws://broker.hivemq.com:8884/mqtt', {
      clientId: `dashboard-${Date.now()}`,
      clean: true,
      reconnectPeriod: 5000,
    });

    mqttClient.on('connect', () => {
      console.log('MQTT Connected');
      setIsConnected(true);

      // Subscribe to default topics
      mqttClient.subscribe('v1/FY-Fab/#', { qos: 0 });
    });

    mqttClient.on('message', (topic, payload) => {
      const message = {
        id: Date.now().toString(),
        timestamp: new Date(),
        topic,
        payload: JSON.parse(payload.toString()),
      };

      setMessages((prev) => [...prev.slice(-49), message]);
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT Error:', err);
    });

    mqttClient.on('close', () => {
      setIsConnected(false);
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end();
    };
  }, []);

  const subscribe = (topic: string) => {
    if (client) {
      client.subscribe(topic, { qos: 0 });
    }
  };

  const publish = (topic: string, message: any) => {
    if (client) {
      client.publish(topic, JSON.stringify(message), { qos: 1 });
    }
  };

  return (
    <MqttContext.Provider value={{ client, isConnected, messages, subscribe, publish }}>
      {children}
    </MqttContext.Provider>
  );
};