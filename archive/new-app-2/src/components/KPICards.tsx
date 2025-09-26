import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown, Activity, Package } from 'lucide-react';

interface KPIData {
  activeJobs: number;
  oee: number;
  productionRate: number;
  qualityRate: number;
}

export const KPICards: React.FC<{ data?: KPIData }> = ({ data }) => {
  const kpis = [
    {
      title: '活跃任务',
      value: data?.activeJobs || 0,
      icon: Activity,
      trend: 'up',
      change: '+12%'
    },
    {
      title: 'OEE',
      value: `${data?.oee || 0}%`,
      icon: TrendingUp,
      trend: 'up',
      change: '+3.2%'
    },
    {
      title: '生产率',
      value: `${data?.productionRate || 0}/h`,
      icon: Package,
      trend: 'down',
      change: '-2.1%'
    },
    {
      title: '质量率',
      value: `${data?.qualityRate || 0}%`,
      icon: TrendingUp,
      trend: 'up',
      change: '+1.5%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {kpi.title}
            </CardTitle>
            <kpi.icon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className={`text-xs ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {kpi.change} 较昨日
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};