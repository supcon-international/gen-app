import React from "react";
import { Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { MQTTStatus } from "@/types";
import { ConnectionPanel } from "@/components/features/ConnectionPanel";

interface HeaderProps {
  status: MQTTStatus;
  onConnect: (params: { url: string; username?: string; password?: string }) => void;
  onDisconnect: () => void;
}

const StatusIndicator: React.FC<{ status: MQTTStatus }> = ({ status }) => {
  const config = {
    idle: { color: "bg-gray-400", pulse: false, text: "离线" },
    connecting: { color: "bg-yellow-400", pulse: true, text: "连接中" },
    connected: { color: "bg-green-400", pulse: false, text: "已连接" },
    error: { color: "bg-red-400", pulse: false, text: "错误" }
  };

  const { color, pulse, text } = config[status];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        {pulse && (
          <div className={`absolute inset-0 w-2 h-2 rounded-full ${color} animate-ping`} />
        )}
      </div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ status, onConnect, onDisconnect }) => {
  return (
    <header className="glass-effect border-b">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 rounded-lg">
                <Activity className="w-5 h-5 text-white dark:text-gray-900" />
              </div>
              <h1 className="text-xl font-bold text-gradient">MES 控制中心</h1>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <StatusIndicator status={status} />
          </div>
          <ConnectionPanel
            status={status}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        </div>
      </div>
    </header>
  );
};