import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertItem {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  station: string;
  description: string;
  acknowledged: boolean;
}

const severityIcons = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const severityColors = {
  critical: 'border-red-500',
  warning: 'border-yellow-500',
  info: 'border-blue-500'
};

export const AlertsPanel: React.FC<{ alerts?: AlertItem[] }> = ({ alerts = [] }) => {
  const defaultAlerts: AlertItem[] = [
    {
      id: '1',
      timestamp: new Date(),
      severity: 'critical',
      station: 'COAT01',
      description: '需要换色清洗',
      acknowledged: false
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 600000),
      severity: 'warning',
      station: 'CH02',
      description: '模具寿命接近上限',
      acknowledged: false
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1200000),
      severity: 'info',
      station: 'LASER01',
      description: '计划维护提醒',
      acknowledged: true
    }
  ];

  const displayAlerts = alerts.length > 0 ? alerts : defaultAlerts;

  return (
    <Card>
      <CardHeader>
        <CardTitle>活动警报</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayAlerts.map((alert) => {
          const Icon = severityIcons[alert.severity];
          return (
            <Alert key={alert.id} className={severityColors[alert.severity]}>
              <Icon className="h-4 w-4" />
              <AlertTitle>{alert.station}</AlertTitle>
              <AlertDescription>
                {alert.description}
                <div className="text-xs text-muted-foreground mt-1">
                  {alert.timestamp.toLocaleTimeString()}
                </div>
              </AlertDescription>
            </Alert>
          );
        })}
      </CardContent>
    </Card>
  );
};