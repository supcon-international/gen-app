// MQTT Types
export interface MQTTMessage {
  topic: string;
  payload: string;
  timestamp: number;
}

export type MQTTStatus = "idle" | "connecting" | "connected" | "error";

export interface MQTTConnectOptions {
  url: string;
  username?: string;
  password?: string;
  clientIdPrefix?: string;
}

// Alert Types
export interface Alert {
  id: string;
  level: "high" | "medium" | "low";
  message: string;
  timestamp: Date;
}

// Metric Types
export interface Metric {
  id: string;
  title: string;
  value: number | string;
  trend?: {
    value: number;
    direction: "up" | "down" | "stable";
    label: string;
  };
  icon?: string;
}