import { useState, useEffect } from "react";
import { useMQTT } from "@/mqtt/MQTTProvider";
import { Wifi, WifiOff, Send, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function App() {
  const { state, connect, subscribe, publish, end } = useMQTT();
  const [brokerUrl, setBrokerUrl] = useState("wss://broker.emqx.io:8084/mqtt");
  const [testTopic, setTestTopic] = useState("test/mqtt/connection");
  const [testMessage, setTestMessage] = useState("Hello MQTT!");
  const [isConnecting, setIsConnecting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 10));
  };

  useEffect(() => {
    if (state.status === "connected") {
      addLog("✅ 成功连接到 MQTT Broker");
      subscribe(testTopic, 0);
      addLog(`📥 已订阅主题: ${testTopic}`);
    } else if (state.status === "error") {
      const errorMsg = state.error || "Unknown error";
      addLog(`❌ 连接失败: ${errorMsg}`);
    } else if (state.status === "connecting") {
      addLog("🔄 正在连接...");
    }
  }, [state.status, state.error]);

  useEffect(() => {
    if (state.last) {
      addLog(`📨 收到消息 [${state.last.topic}]: ${state.last.payload}`);
    }
  }, [state.last]);

  const handleConnect = () => {
    if (state.status === "connected") {
      end();
      addLog("🔌 已断开连接");
    } else {
      setIsConnecting(true);
      addLog(`🚀 尝试连接到: ${brokerUrl}`);
      connect({ url: brokerUrl, clientIdPrefix: "mqtt-test" });
      setTimeout(() => setIsConnecting(false), 2000);
    }
  };

  const handlePublish = () => {
    if (state.status === "connected") {
      publish(testTopic, testMessage);
      addLog(`📤 发送消息到 [${testTopic}]: ${testMessage}`);
    }
  };

  const getStatusIcon = () => {
    switch (state.status) {
      case "connected":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "connecting":
        return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <WifiOff className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (state.status) {
      case "connected":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "connecting":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            MQTT Broker 连接测试
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            测试 MQTT broker 连接性，订阅主题和发布消息
          </p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                连接状态
              </span>
              <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="text-sm font-medium capitalize">{state.status}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Display */}
            {state.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>错误详情:</strong> {state.error}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Broker URL
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="wss://broker.example.com:8083/mqtt"
                  value={brokerUrl}
                  onChange={(e) => setBrokerUrl(e.target.value)}
                  disabled={state.status === "connected"}
                  className="flex-1"
                />
                <Button
                  onClick={handleConnect}
                  disabled={!brokerUrl}
                  variant={state.status === "connected" ? "destructive" : "default"}
                  className="min-w-[120px]"
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : state.status === "connected" ? (
                    <>
                      <WifiOff className="w-4 h-4 mr-2" />
                      断开
                    </>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4 mr-2" />
                      连接
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Test Brokers */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">快速测试:</span>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setBrokerUrl("wss://test.mosquitto.org:8081")}
              >
                test.mosquitto.org
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setBrokerUrl("wss://broker.hivemq.com:8884/mqtt")}
              >
                broker.hivemq.com
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setBrokerUrl("wss://broker.emqx.io:8084/mqtt")}
              >
                broker.emqx.io
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Publish Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              发布测试消息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                主题 (Topic)
              </label>
              <Input
                placeholder="test/topic"
                value={testTopic}
                onChange={(e) => setTestTopic(e.target.value)}
                disabled={state.status !== "connected"}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                消息 (Payload)
              </label>
              <Input
                placeholder="Hello MQTT!"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                disabled={state.status !== "connected"}
              />
            </div>
            <Button
              onClick={handlePublish}
              disabled={state.status !== "connected" || !testTopic || !testMessage}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              发送测试消息
            </Button>
          </CardContent>
        </Card>

        {/* Connection Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>连接日志</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogs([])}
              >
                清空
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 dark:bg-black rounded-lg p-4 h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  等待操作...
                </p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-sm font-mono text-gray-300">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Latest Message */}
        {state.last && (
          <Card>
            <CardHeader>
              <CardTitle>最新接收消息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{state.last.topic}</Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(state.last.ts).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {state.last.payload}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}