import mqtt, { IClientOptions, MqttClient } from "mqtt";

export type MQTTStatus = "idle" | "connecting" | "connected" | "error";

export interface MQTTConnectParams {
  url: string;
  username?: string;
  password?: string;
  clientIdPrefix?: string;
}

export class MQTTService {
  private client: MqttClient | null = null;
  public status: MQTTStatus = "idle";
  public lastError: string | null = null;

  connect(params: MQTTConnectParams, onMessage: (t: string, p: Uint8Array) => void, onError?: (err: Error) => void) {
    // 如果已经有连接，先断开
    if (this.client) {
      this.client.end(true);
    }

    const clientId = `${params.clientIdPrefix ?? "mes"}-${Date.now()}`;
    const opts: IClientOptions = {
      clean: true,
      connectTimeout: 10000,  // 增加超时时间
      reconnectPeriod: 5000,   // 增加重连间隔
      keepalive: 60,
      clientId,
      username: params.username,
      password: params.password,
      rejectUnauthorized: false  // 对于测试环境，不验证证书
    };

    console.log("MQTT: Attempting to connect to", params.url);
    this.status = "connecting";
    this.lastError = null;

    try {
      this.client = mqtt.connect(params.url, opts);

      this.client.on("connect", () => {
        console.log("MQTT: Successfully connected");
        this.status = "connected";
        this.lastError = null;
      });

      this.client.on("reconnect", () => {
        console.log("MQTT: Attempting to reconnect");
        this.status = "connecting";
      });

      this.client.on("error", (err) => {
        console.error("MQTT: Connection error", err);
        this.status = "error";
        this.lastError = err.message || "Unknown error";
        if (onError) {
          onError(err);
        }
      });

      this.client.on("close", () => {
        console.log("MQTT: Connection closed");
        if (this.status === "connected") {
          this.status = "idle";
        }
      });

      this.client.on("offline", () => {
        console.log("MQTT: Client offline");
      });

      this.client.on("message", (topic, payload) => onMessage(topic, payload));
    } catch (err) {
      console.error("MQTT: Failed to create client", err);
      this.status = "error";
      this.lastError = err instanceof Error ? err.message : "Failed to create client";
      if (onError) {
        onError(err as Error);
      }
    }
  }

  isConnected() {
    return this.client?.connected ?? false;
  }

  subscribe(topic: string | string[], qos: 0 | 1 | 2 = 0) {
    this.client?.subscribe(topic, { qos });
  }

  publish(topic: string, payload: string | Uint8Array, qos: 0 | 1 | 2 = 0, retain = false) {
    this.client?.publish(topic, payload, { qos, retain });
  }

  end() {
    this.client?.end(true);
    this.client = null;
    this.status = "idle";
  }
}