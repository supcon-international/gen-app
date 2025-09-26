import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

interface Message {
  id: string;
  timestamp: Date;
  topic: string;
  payload: any;
}

export const MessageFeed: React.FC<{ messages?: Message[] }> = ({ messages = [] }) => {
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (messages.length > 0) {
      setDisplayMessages(messages.slice(-50)); // Keep last 50 messages
    }
  }, [messages]);

  // Generate sample messages if none provided
  useEffect(() => {
    if (messages.length === 0) {
      const sampleMessages: Message[] = [
        {
          id: '1',
          timestamp: new Date(),
          topic: 'v1/FY-Fab/sheet/LASER01/state/current-job',
          payload: { job_id: 'JOB-001', status: 'running' }
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000),
          topic: 'v1/FY-Fab/cold/CH01/metrics/count',
          payload: { count: 150 }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 2000),
          topic: 'v1/FY-Fab/sched/state/queue-snapshot',
          payload: { queued_jobs: 5, running_jobs: 3 }
        }
      ];
      setDisplayMessages(sampleMessages);
    }
  }, [messages.length]);

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>消息流</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px]">
          <div className="space-y-2">
            {displayMessages.map((msg) => (
              <div key={msg.id} className="border rounded p-2 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">
                    {msg.timestamp.toLocaleTimeString()}
                  </Badge>
                  <span className="text-xs text-muted-foreground truncate ml-2">
                    {msg.topic}
                  </span>
                </div>
                <pre className="text-xs bg-muted p-1 rounded overflow-x-auto">
                  {JSON.stringify(msg.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};