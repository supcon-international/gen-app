import { MQTTStatus } from "@/types";

const STATUS_CONFIG: Record<MQTTStatus, { color: string; pulse: boolean; label: string }> = {
  idle: { color: "bg-gray-400", pulse: false, label: "离线" },
  connecting: { color: "bg-yellow-400", pulse: true, label: "连接中" },
  connected: { color: "bg-green-400", pulse: false, label: "已连接" },
  error: { color: "bg-red-400", pulse: false, label: "错误" }
};

interface MQTTStatusIndicatorProps {
  status: MQTTStatus;
}

export function MQTTStatusIndicator({ status }: MQTTStatusIndicatorProps) {
  const { color, pulse, label } = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        {pulse && <div className={`absolute inset-0 w-2 h-2 rounded-full ${color} animate-ping`} />}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
