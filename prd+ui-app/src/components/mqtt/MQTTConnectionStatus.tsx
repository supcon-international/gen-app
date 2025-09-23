import { useCallback, useEffect, useMemo } from "react";
import { ConnectionPanel } from "@/components/features/ConnectionPanel";
import { MQTTStatusIndicator } from "./MQTTStatusIndicator";
import { useMQTT } from "@/mqtt/MQTTProvider";

interface MQTTConnectionStatusProps {
  autoConnect?: boolean;
  defaultUrl?: string;
  clientIdPrefix?: string;
  className?: string;
}

const FALLBACK_URL = "wss://broker.hivemq.com:8884/mqtt";

export function MQTTConnectionStatus({
  autoConnect = true,
  defaultUrl,
  clientIdPrefix = "mes-dashboard",
  className
}: MQTTConnectionStatusProps) {
  const { state, connect, end } = useMQTT();

  const url = useMemo(
    () => defaultUrl ?? import.meta.env.VITE_MQTT_URL ?? FALLBACK_URL,
    [defaultUrl]
  );

  useEffect(() => {
    if (!autoConnect) return;

    if ((state.status === "idle" || state.status === "error") && url) {
      connect({
        url,
        clientIdPrefix
      });
    }
  }, [autoConnect, clientIdPrefix, connect, state.status, url]);

  const handleConnect = useCallback(
    (params: { url: string; username?: string; password?: string }) => {
      connect({
        ...params,
        clientIdPrefix
      });
    },
    [clientIdPrefix, connect]
  );

  return (
    <div className={`flex items-center gap-4 ${className ?? ""}`}>
      <MQTTStatusIndicator status={state.status} />
      <ConnectionPanel
        status={state.status}
        onConnect={handleConnect}
        onDisconnect={end}
        defaultUrl={url}
      />
    </div>
  );
}
