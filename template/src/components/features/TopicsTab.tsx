import React, { useState } from "react";
import { Wifi, WifiOff, Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MQTTMessage, MQTTStatus } from "@/types";

interface TopicsTabProps {
  status: MQTTStatus;
  lastMessage?: MQTTMessage;
  onPublish: (topic: string, payload: string) => void;
}

export const TopicsTab: React.FC<TopicsTabProps> = ({ status, lastMessage, onPublish }) => {
  const [pubTopic, setPubTopic] = useState("");
  const [pubPayload, setPubPayload] = useState("");

  const handlePublish = () => {
    if (pubTopic && pubPayload) {
      onPublish(pubTopic, pubPayload);
      setPubTopic("");
      setPubPayload("");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            最近消息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lastMessage ? (
              <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="secondary">{lastMessage.topic}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(lastMessage.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
                  {lastMessage.payload}
                </pre>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                <WifiOff className="w-12 h-12 opacity-20" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="w-4 h-4" />
            发布消息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="主题: /factory/cmd/..."
            value={pubTopic}
            onChange={e => setPubTopic(e.target.value)}
            className="bg-white/50 dark:bg-gray-800/50"
          />
          <textarea
            placeholder='消息内容: {"action":"start"}'
            value={pubPayload}
            onChange={e => setPubPayload(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm resize-none h-24"
          />
          <Button
            onClick={handlePublish}
            disabled={!pubTopic || !pubPayload || status !== "connected"}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-1" />
            发送消息
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};