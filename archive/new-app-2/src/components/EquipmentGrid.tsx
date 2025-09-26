import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface Equipment {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'queued' | 'maintenance' | 'error';
  currentJob?: string;
  batchQty?: number;
  operator?: string;
}

const statusColors = {
  idle: 'bg-gray-200',
  running: 'bg-green-500',
  queued: 'bg-yellow-500',
  maintenance: 'bg-orange-500',
  error: 'bg-red-500'
};

const statusLabels = {
  idle: '空闲',
  running: '运行中',
  queued: '排队中',
  maintenance: '维护中',
  error: '故障'
};

export const EquipmentGrid: React.FC<{ equipment?: Equipment[] }> = ({ equipment = [] }) => {
  const defaultEquipment: Equipment[] = [
    { id: 'LASER01', name: '激光切割机1', status: 'running', currentJob: 'JOB-001', batchQty: 100 },
    { id: 'BEND01', name: '折弯机1', status: 'idle' },
    { id: 'COAT01', name: '喷涂线1', status: 'queued', currentJob: 'JOB-002', batchQty: 50 },
    { id: 'ASSY01', name: '装配线1', status: 'running', currentJob: 'JOB-003', batchQty: 75 },
    { id: 'CUT01', name: '切线机1', status: 'maintenance' },
    { id: 'CH01', name: '冷镦机1', status: 'running', currentJob: 'JOB-004', batchQty: 200 }
  ];

  const displayEquipment = equipment.length > 0 ? equipment : defaultEquipment;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {displayEquipment.map((equip) => (
        <Card key={equip.id} className="relative">
          <div className={`absolute top-0 right-0 w-3 h-3 rounded-full m-2 ${statusColors[equip.status]}`} />
          <CardHeader>
            <CardTitle className="text-base">{equip.name}</CardTitle>
            <Badge variant="outline">{statusLabels[equip.status]}</Badge>
          </CardHeader>
          <CardContent className="text-sm">
            {equip.currentJob && (
              <div>
                <p className="font-medium">当前任务: {equip.currentJob}</p>
                {equip.batchQty && <p>批量: {equip.batchQty}</p>}
              </div>
            )}
            {!equip.currentJob && equip.status === 'idle' && (
              <p className="text-muted-foreground">等待任务分配</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};