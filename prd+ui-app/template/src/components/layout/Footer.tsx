import React from "react";
import { MQTTStatus } from "@/types";

interface FooterProps {
  status: MQTTStatus;
}

export const Footer: React.FC<FooterProps> = ({ status }) => {
  return (
    <footer className="glass-effect border-t mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="capitalize">{status}</span>
          <span>|</span>
          <span>MES v0.1.0</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Powered by React + MQTT
        </div>
      </div>
    </footer>
  );
};