"use client";

/**
 * Fleet state client.
 *
 * The backend (EdgeAI_Backend) is the single source of truth: world graph, robots, tasks, leases,
 * events, P2P packets and KPIs all arrive over /ws/fleet and are rendered as-is. This module never
 * simulates anything. When the backend is unreachable the last known state stays visible and the
 * connection is reported as "offline"; commands fail loudly instead of pretending to succeed.
 *
 * <FleetProvider> owns the one WebSocket for the whole app; `useFleetSocket()` reads it.
 */

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";

const apiBase = process.env.NEXT_PUBLIC_EDGE_API_BASE_URL ?? "http://localhost:8000";
const wsBase = apiBase.replace(/^http/, "ws");
// Mirrors the backend's AUTH_REQUIRED: when true there is nothing to stream without a session.
const authRequired = process.env.NEXT_PUBLIC_AUTH_REQUIRED !== "false";

// ── Types mirroring backend schemas.py ────────────────────────────────────

export type RobotId = string;
export type RobotStatus = "Idle" | "Moving" | "Yielding" | "Rerouting" | "Task handoff" | "Charging" | "Blocked";
export type RobotLeg = "idle" | "to_pickup" | "to_drop" | "to_home" | "to_charge";
export type EventType = "LEASE" | "INTENT" | "REROUTE" | "HANDOFF" | "HEARTBEAT";
export type TaskStatus = "Queued" | "Assigned" | "In Progress" | "Completed" | "Blocked";
export type PayloadSize = "small" | "medium" | "heavy" | "pallet";
export type UrgencyLevel = "low" | "standard" | "critical";

export interface Point { x: number; y: number; }

export interface RobotState {
  id: RobotId;
  name: string;
  color: string;
  battery: number;
  status: RobotStatus;
  task: string;
  task_id?: string | null;
  leg?: RobotLeg;
  target?: string | null;
  priority: number;
  path: Point[];
  path_index: number;
  progress: number;
  position: Point;
  completed: number;
  payload_capacity_kg?: number;
  current_payload_kg?: number;
}

export interface FleetEvent {
  id?: number;
  time: string;
  type: EventType;
  message: string;
}

export interface P2PMessagePacket {
  id: string;
  sender: RobotId;
  recipient: RobotId | "MESH";
  type: "MUTEX_REQ" | "MUTEX_GRANT" | "YIELD_ACK" | "OBSTACLE_ALERT" | "TASK_BID" | "HEARTBEAT";
  payload: string;
  timestamp: string;
}

export interface TaskRecord {
  id: string;
  pickup: string;
  destination: string;
  priority: number;
  status: TaskStatus;
  payload_kg: number;
  payload_size: PayloadSize;
  urgency: UrgencyLevel;
  assigned_robot_id: RobotId | null;
  created_at: string;
}

interface ServerKpis {
  fleet_utilization_pct: number;
  avg_battery_pct: number;
  collision_count: number;
  active_leases: number;
  operational_pct: number;
  completed_total: number;
  queued_tasks: number;
  tasks_per_hour: number;
  tick: number;
}

export interface FleetState {
  seq: number;
  tick: number;
  running: boolean;
  aisle_blocked: boolean;
  blocked_nodes: string[];
  reservation: RobotId | null;
  lease_until: number;
  leases: Record<string, RobotId>;
  completed_tasks: number;
  collision_count: number;
  messages: number;
  events: FleetEvent[];
  p2p: P2PMessagePacket[];
  robots: RobotState[];
  tasks: TaskRecord[];
  kpis: ServerKpis;
}

export interface WorldNode { id: string; x: number; y: number; label: string; type: "rack" | "dock" | "corridor" | "transit" | "charge"; }
export interface WorldRobot { id: RobotId; name: string; color: string; max_payload_kg: number; speed: number; home: string; }
export interface WorldConfig {
  control_period_s: number;
  low_battery_pct: number;
  min_bid_battery_pct: number;
  collision_radius: number;
}
export interface World {
  nodes: WorldNode[];
  edges: [string, string][];
  mutex_zones: string[];
  robots: WorldRobot[];
  config: WorldConfig;
}

export interface TaskCreateInput {
  pickup: string;
  destination: string;
  priority: number;
  payload_kg?: number;
  payload_size?: PayloadSize;
  urgency?: UrgencyLevel;
}

export interface TaskUpdateInput {
  priority?: number;
  payload_kg?: number;
  payload_size?: PayloadSize;
  urgency?: UrgencyLevel;
  assigned_robot_id?: RobotId | null;
  status?: TaskStatus;
}

export interface KPIMetrics {
  fleetUtilizationPct: number;
  avgBatteryPct: number;
  collisionCount: number;
  activeLeases: number;
  meshHealthPct: number;
  completedTotal: number;
  queuedTasks: number;
  tick: number;
  tasksPerHour: number;
}

/** Rolling window of real samples, one per simulation tick, shared by every screen. */
export interface FleetHistory {
  tick: number[];
  battery: Record<string, number[]>;
  messageRate: number[];
  leaseHolder: (string | null)[];
  lastMessages: number;
  /** cumulative robot-position density on a 40-unit grid ("x,y" -> samples) since the last reset */
  heat: Record<string, number>;
}

export type ConnectionMode = "live" | "offline";

export interface FleetSocketState {
  fleetState: FleetState | null;
  world: World | null;
  history: FleetHistory;
  robots: RobotState[];
  events: FleetEvent[];
  p2pMessages: P2PMessagePacket[];
  tasks: TaskRecord[];
  kpis: KPIMetrics;
  connectionMode: ConnectionMode;
  isConnected: boolean;
  /** true when the backend requires a session and there is none */
  needsLogin: boolean;
  error: string | null;
  clearError: () => void;
  robotColor: (robotId?: string | null) => string;
  sendControl: (action: "start" | "pause" | "reset") => Promise<boolean>;
  createTask: (input: TaskCreateInput) => Promise<TaskRecord | null>;
  updateTask: (taskId: string, input: TaskUpdateInput) => Promise<TaskRecord | null>;
  deleteTask: (taskId: string) => Promise<boolean>;
  completeTask: (taskId: string) => Promise<boolean>;
  setBlockage: (nodeId: string, blocked: boolean) => Promise<boolean>;
  injectBlockage: (nodeId?: string) => Promise<boolean>;
  requestReservation: (robotId: RobotId, corridorId?: string, leaseSeconds?: number) => Promise<boolean>;
  publishIntent: (robotId: RobotId, corridorId?: string, etaSeconds?: number) => Promise<boolean>;
  setRobotBattery: (robotId: RobotId, battery?: number) => Promise<boolean>;
  simulateAgentDropout: (robotId: RobotId) => Promise<boolean>;
}

const EMPTY_KPI: KPIMetrics = {
  fleetUtilizationPct: 0,
  avgBatteryPct: 0,
  collisionCount: 0,
  activeLeases: 0,
  meshHealthPct: 0,
  completedTotal: 0,
  queuedTasks: 0,
  tick: 0,
  tasksPerHour: 0,
};
const HISTORY_WINDOW = 120;
const EMPTY_HISTORY: FleetHistory = { tick: [], battery: {}, messageRate: [], leaseHolder: [], lastMessages: 0, heat: {} };

function recordSample(prev: FleetHistory, state: FleetState): FleetHistory {
  const last = prev.tick[prev.tick.length - 1];
  if (last !== undefined && state.tick === last) return prev; // command responses repeat the current tick
  const base = last !== undefined && state.tick > last ? prev : EMPTY_HISTORY; // tick went backwards: floor was reset
  const battery: Record<string, number[]> = {};
  for (const r of state.robots) battery[r.id] = [...(base.battery[r.id] ?? []), r.battery].slice(-HISTORY_WINDOW);
  const delta = base.tick.length === 0 ? 0 : Math.max(0, state.messages - base.lastMessages);
  const heat = { ...base.heat };
  for (const r of state.robots) {
    const cell = `${Math.round(r.position.x / 40) * 40},${Math.round(r.position.y / 40) * 40}`;
    heat[cell] = (heat[cell] ?? 0) + 1;
  }
  return {
    tick: [...base.tick, state.tick].slice(-HISTORY_WINDOW),
    battery,
    messageRate: [...base.messageRate, delta].slice(-HISTORY_WINDOW),
    leaseHolder: [...base.leaseHolder, state.reservation].slice(-HISTORY_WINDOW),
    lastMessages: state.messages,
    heat,
  };
}

const EMPTY_ROBOTS: RobotState[] = [];
const EMPTY_EVENTS: FleetEvent[] = [];
const EMPTY_P2P: P2PMessagePacket[] = [];
const EMPTY_TASKS: TaskRecord[] = [];
const NEUTRAL_COLOR = "#64748B";

function describeError(body: unknown, status: number): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => (d as { msg?: string }).msg ?? "invalid input").join("; ");
  return `Request failed (${status})`;
}

const FleetContext = createContext<FleetSocketState | null>(null);

export function FleetProvider({ children }: { children: ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const token = session?.access_token ?? null;
  const canConnect = !authLoading && (!authRequired || token !== null);

  const [fleetState, setFleetState] = useState<FleetState | null>(null);
  const [world, setWorld] = useState<World | null>(null);
  const [history, setHistory] = useState<FleetHistory>(EMPTY_HISTORY);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSeq = useRef(0);

  const applyState = useCallback((state: FleetState) => {
    if (state.seq >= lastSeq.current) {
      lastSeq.current = state.seq;
      setFleetState(state);
      setHistory((prev) => recordSample(prev, state));
    }
  }, []);

  // Signing out drops everything the previous session could see.
  useEffect(() => {
    if (!authLoading && authRequired && token === null) {
      lastSeq.current = 0;
      setFleetState(null);
      setWorld(null);
      setHistory(EMPTY_HISTORY);
    }
  }, [authLoading, token]);

  // One WebSocket for the whole app, with exponential reconnect back-off.
  useEffect(() => {
    if (!canConnect) return;
    let socket: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      try {
        // The token travels in the subprotocol header, never in the URL.
        socket = token ? new WebSocket(`${wsBase}/ws/fleet`, ["edgefleet", token]) : new WebSocket(`${wsBase}/ws/fleet`);
      } catch {
        timer = setTimeout(connect, 5000);
        return;
      }
      socket.onopen = () => {
        attempt = 0;
        lastSeq.current = 0; // each connection starts with a full snapshot; a restarted server resets seq
        setIsConnected(true);
      };
      socket.onmessage = (event) => {
        try {
          applyState(JSON.parse(event.data as string) as FleetState);
        } catch {
          // ignore malformed frame
        }
      };
      socket.onclose = () => {
        setIsConnected(false);
        if (!cancelled) timer = setTimeout(connect, Math.min(10000, 1000 * 2 ** attempt++));
      };
      socket.onerror = () => socket?.close();
    };

    connect();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      socket?.close();
    };
  }, [token, canConnect, applyState]);

  // The world (graph, fleet specs, mutex zones) is fetched, never hardcoded.
  useEffect(() => {
    if (!isConnected) return;
    let cancelled = false;
    fetch(`${apiBase}/api/world`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => (res.ok ? (res.json() as Promise<World>) : null))
      .then((data) => {
        if (data && !cancelled) setWorld(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [isConnected, token]);

  const call = useCallback(
    async <T,>(path: string, init: RequestInit = {}): Promise<T | null> => {
      try {
        const res = await fetch(`${apiBase}${path}`, {
          ...init,
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (!res.ok) {
          setError(describeError(await res.json().catch(() => null), res.status));
          return null;
        }
        return res.status === 204 ? (true as unknown as T) : ((await res.json()) as T);
      } catch {
        setError("Backend unreachable — command was not sent");
        return null;
      }
    },
    [token]
  );

  const post = useCallback(
    async (path: string, body?: unknown): Promise<boolean> => {
      const state = await call<FleetState>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });
      if (state && typeof state === "object" && "robots" in state) applyState(state);
      return state !== null;
    },
    [call, applyState]
  );

  const sendControl = useCallback(
    (action: "start" | "pause" | "reset") =>
      action === "reset" ? post("/api/fleet/reset") : post("/api/fleet/simulation", { running: action === "start" }),
    [post]
  );

  // Task changes reach every client through the WebSocket snapshot; the response is returned to the caller.
  const createTask = useCallback((input: TaskCreateInput) => call<TaskRecord>("/api/tasks", { method: "POST", body: JSON.stringify(input) }), [call]);
  const updateTask = useCallback((taskId: string, input: TaskUpdateInput) => call<TaskRecord>(`/api/tasks/${encodeURIComponent(taskId)}`, { method: "PATCH", body: JSON.stringify(input) }), [call]);
  const deleteTask = useCallback(async (taskId: string) => (await call<boolean>(`/api/tasks/${encodeURIComponent(taskId)}`, { method: "DELETE" })) !== null, [call]);
  const completeTask = useCallback(async (taskId: string) => (await call<TaskRecord>(`/api/tasks/${encodeURIComponent(taskId)}/complete`, { method: "POST" })) !== null, [call]);

  const setBlockage = useCallback((nodeId: string, blocked: boolean) => post("/api/fleet/blockages", { aisle_id: nodeId, blocked }), [post]);
  // Toggle: with nothing blocked, block `nodeId`; otherwise clear every active blockage.
  const blockedNodes = fleetState?.blocked_nodes;
  const injectBlockage = useCallback(
    async (nodeId = "B-07") => {
      if (!blockedNodes || blockedNodes.length === 0) return setBlockage(nodeId, true);
      return (await Promise.all(blockedNodes.map((id) => setBlockage(id, false)))).every(Boolean);
    },
    [setBlockage, blockedNodes]
  );
  const requestReservation = useCallback(
    (robotId: RobotId, corridorId = "C-14", leaseSeconds = 4.8) => post("/api/fleet/reservations", { robot_id: robotId, corridor_id: corridorId, lease_seconds: leaseSeconds }),
    [post]
  );
  const publishIntent = useCallback(
    (robotId: RobotId, corridorId = "C-14", etaSeconds = 5.0) => post("/api/fleet/intents", { robot_id: robotId, corridor_id: corridorId, eta_seconds: etaSeconds }),
    [post]
  );
  const setRobotBattery = useCallback(
    (robotId: RobotId, battery = 22.0) => post("/api/fleet/faults/battery", { robot_id: robotId, battery }),
    [post]
  );
  const simulateAgentDropout = useCallback(
    (robotId: RobotId) => post("/api/fleet/faults/dropout", { robot_id: robotId }),
    [post]
  );

  const robots = fleetState?.robots ?? EMPTY_ROBOTS;
  const robotColor = useCallback(
    (robotId?: string | null) => (robotId ? robots.find((r) => r.id === robotId)?.color ?? world?.robots.find((r) => r.id === robotId)?.color : undefined) ?? NEUTRAL_COLOR,
    [robots, world]
  );

  const kpis = useMemo<KPIMetrics>(() => {
    const k = fleetState?.kpis;
    return k
      ? {
          fleetUtilizationPct: k.fleet_utilization_pct,
          avgBatteryPct: k.avg_battery_pct,
          collisionCount: k.collision_count,
          activeLeases: k.active_leases,
          meshHealthPct: k.operational_pct,
          completedTotal: k.completed_total,
          queuedTasks: k.queued_tasks,
          tick: k.tick,
          tasksPerHour: k.tasks_per_hour,
        }
      : EMPTY_KPI;
  }, [fleetState?.kpis]);

  const value = useMemo<FleetSocketState>(
    () => ({
      fleetState,
      world,
      history,
      robots,
      events: fleetState?.events ?? EMPTY_EVENTS,
      p2pMessages: fleetState?.p2p ?? EMPTY_P2P,
      tasks: fleetState?.tasks ?? EMPTY_TASKS,
      kpis,
      connectionMode: isConnected ? "live" : "offline",
      isConnected,
      needsLogin: !authLoading && authRequired && token === null,
      error,
      clearError: () => setError(null),
      robotColor,
      sendControl,
      createTask,
      updateTask,
      deleteTask,
      completeTask,
      setBlockage,
      injectBlockage,
      requestReservation,
      publishIntent,
      setRobotBattery,
      simulateAgentDropout,
    }),
    [fleetState, world, history, robots, kpis, isConnected, authLoading, token, error, robotColor, sendControl, createTask, updateTask, deleteTask, completeTask, setBlockage, injectBlockage, requestReservation, publishIntent, setRobotBattery, simulateAgentDropout]
  );

  return createElement(FleetContext.Provider, { value }, children);
}

/** Shared fleet state. The optional argument is ignored (kept so existing call sites keep compiling). */
export function useFleetSocket(_token?: string | null): FleetSocketState {
  void _token;
  const context = useContext(FleetContext);
  if (!context) throw new Error("useFleetSocket must be used inside <FleetProvider>");
  return context;
}
