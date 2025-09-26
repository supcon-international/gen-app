import React from "react";
import { Package, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend }) => (
  <Card className="card-hover overflow-hidden relative">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent dark:from-gray-800 rounded-full -mr-16 -mt-16 opacity-50" />
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-gray-400">{icon}</div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </div>
      )}
    </CardContent>
  </Card>
);

export const MetricsGrid: React.FC = () => {
  const metrics = [
    {
      title: "在库总量",
      value: "2,845",
      icon: <Package className="w-5 h-5" />,
      trend: "+12% from last month"
    },
    {
      title: "今日入库",
      value: "128",
      icon: <TrendingUp className="w-5 h-5" />,
      trend: "+5% from yesterday"
    },
    {
      title: "今日出库",
      value: "96",
      icon: <TrendingUp className="w-5 h-5 rotate-180" />,
      trend: "-2% from yesterday"
    },
    {
      title: "活动告警",
      value: "3",
      icon: <AlertCircle className="w-5 h-5" />
    }
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </section>
  );
};