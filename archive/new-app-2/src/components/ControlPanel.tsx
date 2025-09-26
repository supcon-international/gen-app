import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Play, Send, RefreshCw, Settings } from 'lucide-react';

interface ControlAction {
  label: string;
  action: string;
  icon: React.ElementType;
  variant?: 'default' | 'secondary' | 'destructive';
}

export const ControlPanel: React.FC<{ onAction?: (action: string) => void }> = ({ onAction }) => {
  const actions: ControlAction[] = [
    { label: '分派任务', action: 'dispatch', icon: Send, variant: 'default' },
    { label: '开始任务', action: 'start', icon: Play, variant: 'default' },
    { label: '换模', action: 'changeMold', icon: RefreshCw, variant: 'secondary' },
    { label: '配置', action: 'configure', icon: Settings, variant: 'secondary' }
  ];

  const handleAction = (action: string) => {
    console.log(`执行操作: ${action}`);
    onAction?.(action);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>控制面板</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Button
            key={action.action}
            variant={action.variant || 'default'}
            onClick={() => handleAction(action.action)}
            className="w-full"
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};