import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert } from "@/types";

const alerts: Alert[] = [
  { id: "1", level: "high", message: "仓库 A 温度超限", timestamp: new Date(Date.now() - 2 * 60000) },
  { id: "2", level: "medium", message: "传送带 B3 速度异常", timestamp: new Date(Date.now() - 15 * 60000) },
  { id: "3", level: "low", message: "工位 C2 待料", timestamp: new Date(Date.now() - 60 * 60000) }
];

const getTimeDifference = (timestamp: Date) => {
  const diff = Date.now() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return "刚刚";
};

export const DashboardTab: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
            库存流转监控
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-sm text-muted-foreground">图表区域</div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            实时告警
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.level === "high" ? "bg-red-500" :
                    alert.level === "medium" ? "bg-yellow-500" : "bg-blue-500"
                  }`} />
                  <span className="text-sm">{alert.message}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {getTimeDifference(alert.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};