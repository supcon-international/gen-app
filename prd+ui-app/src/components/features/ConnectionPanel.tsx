import React, { useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MQTTStatus } from "@/types";

interface ConnectionPanelProps {
  status: MQTTStatus;
  onConnect: (params: { url: string; username?: string; password?: string }) => void;
  onDisconnect: () => void;
  defaultUrl?: string;
}

export const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  status,
  onConnect,
  onDisconnect,
  defaultUrl
}) => {
  const [url, setUrl] = useState(defaultUrl ?? import.meta.env.VITE_MQTT_URL ?? "");
  useEffect(() => {
    if (defaultUrl) {
      setUrl(defaultUrl);
    }
  }, [defaultUrl]);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    if (status === "connected") {
      onDisconnect();
    } else {
      setIsConnecting(true);
      onConnect({ url });
      setTimeout(() => setIsConnecting(false), 1000);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Input
        placeholder="wss://broker.example:8083/mqtt"
        value={url}
        onChange={e => setUrl(e.target.value)}
        className="w-96 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
      />
      <Button
        onClick={handleConnect}
        disabled={!url && status !== "connected"}
        variant={status === "connected" ? "secondary" : "default"}
        className="min-w-[100px]"
      >
        {isConnecting ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : status === "connected" ? (
          <>
            <X className="w-4 h-4 mr-1" />
            断开
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-1" />
            连接
          </>
        )}
      </Button>
    </div>
  );
};
