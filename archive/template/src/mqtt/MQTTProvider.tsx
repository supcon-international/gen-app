import React, { createContext, useContext, useMemo, useReducer, useCallback } from "react";
import { MQTTService, MQTTConnectParams } from "./client";

type Msg = { topic: string; payload: string; ts: number };
type State = {
  status: "idle" | "connecting" | "connected" | "error";
  last?: Msg;
  topics: Record<string, Msg[]>;
  error?: string;
};
type Action =
  | { type: "STATUS"; status: State["status"] }
  | { type: "MESSAGE"; msg: Msg }
  | { type: "ERROR"; error: string }
  | { type: "RESET" };

const initial: State = { status: "idle", topics: {} };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "STATUS":
      return { ...state, status: action.status, error: undefined };
    case "MESSAGE": {
      const { topic } = action.msg;
      const list = state.topics[topic] ?? [];
      const nextList = [action.msg, ...list].slice(0, 100);
      return {
        ...state,
        last: action.msg,
        topics: { ...state.topics, [topic]: nextList }
      };
    }
    case "ERROR":
      return { ...state, status: "error", error: action.error };
    case "RESET":
      return initial;
    default:
      return state;
  }
}

type Ctx = {
  state: State;
  connect: (p: MQTTConnectParams) => void;
  subscribe: (t: string | string[], qos?: 0 | 1 | 2) => void;
  publish: (t: string, p: string, qos?: 0 | 1 | 2, retain?: boolean) => void;
  end: () => void;
};

const MQTTContext = createContext<Ctx | null>(null);

export const MQTTProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initial);
  const service = useMemo(() => new MQTTService(), []);

  const connect = useCallback(
    (params: MQTTConnectParams) => {
      dispatch({ type: "STATUS", status: "connecting" });
      service.connect(
        params,
        (topic, payload) => {
          let text = "";
          try {
            text = new TextDecoder().decode(payload);
          } catch {
            text = String(payload);
          }
          dispatch({
            type: "MESSAGE",
            msg: { topic, payload: text, ts: Date.now() }
          });
        },
        (error) => {
          console.error("MQTT Provider: Connection error", error);
          dispatch({ type: "ERROR", error: error.message });
        }
      );

      // 监听服务状态变化
      const checkStatus = setInterval(() => {
        if (service.status === "connected") {
          dispatch({ type: "STATUS", status: "connected" });
          clearInterval(checkStatus);
        } else if (service.status === "error") {
          dispatch({ type: "ERROR", error: service.lastError || "Connection failed" });
          clearInterval(checkStatus);
        }
      }, 500);
    },
    [service]
  );

  const subscribe = useCallback(
    (t: string | string[], qos: 0 | 1 | 2 = 0) => service.subscribe(t, qos),
    [service]
  );

  const publish = useCallback(
    (t: string, p: string, qos: 0 | 1 | 2 = 0, retain = false) =>
      service.publish(t, p, qos, retain),
    [service]
  );

  const end = useCallback(() => {
    service.end();
    dispatch({ type: "RESET" });
  }, [service]);

  const value = useMemo(
    () => ({ state, connect, subscribe, publish, end }),
    [state, connect, subscribe, publish, end]
  );

  return <MQTTContext.Provider value={value}>{children}</MQTTContext.Provider>;
};

export const useMQTT = () => {
  const ctx = useContext(MQTTContext);
  if (!ctx) throw new Error("useMQTT must be used within MQTTProvider");
  return ctx;
};