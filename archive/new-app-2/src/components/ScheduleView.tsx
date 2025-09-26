import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface Job {
  jobId: string;
  orderId: string;
  productId: string;
  targetStation: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  batchQty: number;
  changeover: boolean;
}

export const ScheduleView: React.FC<{ jobs?: Job[] }> = ({ jobs = [] }) => {
  const defaultJobs: Job[] = [
    {
      jobId: 'JOB-001',
      orderId: 'ORD-2024-001',
      productId: 'P-PANEL1',
      targetStation: 'LASER01',
      scheduledStart: new Date(),
      scheduledEnd: new Date(Date.now() + 3600000),
      batchQty: 100,
      changeover: false
    },
    {
      jobId: 'JOB-002',
      orderId: 'ORD-2024-002',
      productId: 'P-M6',
      targetStation: 'CH01',
      scheduledStart: new Date(Date.now() + 3600000),
      scheduledEnd: new Date(Date.now() + 7200000),
      batchQty: 2000,
      changeover: true
    }
  ];

  const displayJobs = jobs.length > 0 ? jobs : defaultJobs;

  return (
    <Card>
      <CardHeader>
        <CardTitle>生产计划</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>任务ID</TableHead>
              <TableHead>订单</TableHead>
              <TableHead>产品</TableHead>
              <TableHead>工站</TableHead>
              <TableHead>计划开始</TableHead>
              <TableHead>批量</TableHead>
              <TableHead>换型</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayJobs.map((job) => (
              <TableRow key={job.jobId}>
                <TableCell className="font-medium">{job.jobId}</TableCell>
                <TableCell>{job.orderId}</TableCell>
                <TableCell>{job.productId}</TableCell>
                <TableCell>{job.targetStation}</TableCell>
                <TableCell>{job.scheduledStart.toLocaleTimeString()}</TableCell>
                <TableCell>{job.batchQty}</TableCell>
                <TableCell>{job.changeover ? '是' : '否'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};