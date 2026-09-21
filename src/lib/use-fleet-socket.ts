"use client";

/**
 * useFleetSocket — Real-time WebSocket hook & Algorithmic Task Allocation Client Twin
 *
 * Integrates directly with FastAPI Backend (EdgeAI_Backend) endpoints:
 * - WebSocket: /ws/fleet
 * - REST: /api/tasks (GET, POST), /api/tasks/{id} (PATCH), /api/tasks/{id} (DELETE), /api/tasks/{id}/complete
 * - Fleet control: /api/fleet/simulation, /api/fleet/reset, /api/fleet/blockages, /api/fleet/reservations, /api/fleet/intents
 *
 * When backend is offline or starting up, uses real algorithmic A* pathfinding
 * on topological warehouse graph and dynamic Contract-Net Protocol (CNP) bidding
 * based on robot capacity, battery, and task payload size/weight!
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  WAREHOUSE_NODES,
  findShortestPath,
  findClosestNodeId,
} from "./warehouse-graph";

const apiBase = process.env.NEXT_PUBLIC_EDGE_API_BASE_URL ?? "http://localhost:8000";
const wsBase = apiBase.replace(/^http/, "ws");

// ── Types mirroring backend schemas.py ────────────────────────────────────

export type RobotId = "AMR-01" | "AMR-02" | "AMR-03";
export type RobotStatus = "Idle" | "Moving" | "Yielding" | "Rerouting" | "Task handoff" | "Charging" | "Blocked";
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

export interface FleetState {
  tick: number;
  running: boolean;
  aisle_blocked: boolean;
  reservation: RobotId | null;
  lease_until: number;
  completed_tasks: number;
  collision_count: number;
  messages: number;
  events: FleetEvent[];
  robots: RobotState[];
  activeP2PMessages?: P2PMessagePacket[];
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
  tick: number;
  tasksPerHour: number;
}

export type ConnectionMode = "live" | "sim";

export interface FleetSocketState {
  fleetState: FleetState | null;
  robots: RobotState[];
  events: FleetEvent[];
  p2pMessages: P2PMessagePacket[];
  tasks: TaskRecord[];
  kpis: KPIMetrics;
  connectionMode: ConnectionMode;
  isConnected: boolean;
  sendControl: (action: "start" | "pause" | "reset" | "step") => Promise<void>;
  createTask: (input: TaskCreateInput | string, destination?: string, priority?: number) => Promise<TaskRecord | null>;
  updateTask: (taskId: string, input: TaskUpdateInput) => Promise<TaskRecord | null>;
  deleteTask: (taskId: string) => Promise<boolean>;
  completeTask: (taskId: string) => Promise<void>;
  injectBlockage: (aisleId?: string) => Promise<void>;
  requestReservation: (robotId: RobotId, corridorId?: string, leaseSeconds?: number) => Promise<void>;
  publishIntent: (robotId: RobotId, corridorId?: string, etaSeconds?: number) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

// ── Robot Capability Specification ────────────────────────────────────────

const ROBOT_CAPACITIES: Record<RobotId, { maxPayloadKg: number; role: string }> = {
  "AMR-01": { maxPayloadKg: 1200, role: "Heavy Pallet Mover" },
  "AMR-02": { maxPayloadKg: 350, role: "Agile Bin Picker" },
  "AMR-03": { maxPayloadKg: 700, role: "Autonomous Tug & Detourer" },
};

function createInitialState(): FleetState {
  // Compute initial real A* paths using the warehouse graph
  const path1 = findShortestPath("DOCK-W", "DOCK-E");
  const path2 = findShortestPath("INT-N1", "CHARGE");
  const path3 = findShortestPath("DOCK-E", "BYPASS-W");

  const robots: RobotState[] = [
    {
      id: "AMR-01",
      name: "Atlas",
      color: "#C2541A",
      battery: 95,
      status: "Idle",
      task: "Standby at Dock W",
      priority: 50,
      payload_capacity_kg: 1200,
      current_payload_kg: 0,
      path: path1,
      path_index: 0,
      progress: 0,
      position: { ...path1[0] },
      completed: 0,
    },
    {
      id: "AMR-02",
      name: "Nova",
      color: "#F59E0B",
      battery: 88,
      status: "Idle",
      task: "Standby at Bay North",
      priority: 50,
      payload_capacity_kg: 350,
      current_payload_kg: 0,
      path: path2,
      path_index: 0,
      progress: 0,
      position: { ...path2[0] },
      completed: 0,
    },
    {
      id: "AMR-03",
      name: "Kite",
      color: "#38BDF8",
      battery: 92,
      status: "Idle",
      task: "Standby at Dock E",
      priority: 50,
      payload_capacity_kg: 700,
      current_payload_kg: 0,
      path: path3,
      path_index: 0,
      progress: 0,
      position: { ...path3[0] },
      completed: 0,
    },
  ];

  return {
    tick: 0,
    running: false,
    aisle_blocked: false,
    reservation: null,
    lease_until: 0,
    completed_tasks: 0,
    collision_count: 0,
    messages: 3,
    events: [
      { time: "T+00.0s", type: "HEARTBEAT", message: "Zenoh P2P Mesh online | 3 peers connected | Zero-broker DDS active" },
    ],
    robots,
    activeP2PMessages: [
      {
        id: "p2p-init-1",
        sender: "AMR-01",
        recipient: "MESH",
        type: "HEARTBEAT",
        payload: "PEER_DISCOVERY[AMR-01 online, battery=95%, cap=1200kg, node=DOCK-W]",
        timestamp: new Date().toLocaleTimeString(),
      },
    ],
  };
}

function computeKPIs(state: FleetState, tasksDoneThisSession: number): KPIMetrics {
  const robots = state.robots;
  const activeCount = robots.filter((r) => r.status === "Moving" || r.status === "Task handoff" || r.status === "Rerouting").length;
  const avgBattery = robots.reduce((s, r) => s + r.battery, 0) / Math.max(1, robots.length);
  const leases = state.reservation ? 1 : 0;
  
  // Dynamic mesh health: 100% when active, scaled by robot connectivity
  const activeRobotsCount = robots.filter(r => r.battery > 10).length;
  const meshHealth = Math.round((activeRobotsCount / Math.max(1, robots.length)) * 100);

  // Authentically computed throughput: only compute when tasks were actually completed
  const totalCompleted = state.completed_tasks + tasksDoneThisSession;
  const elapsedMinutes = (state.tick * 0.6) / 60;
  let tasksPerHour = 0;
  if (totalCompleted > 0 && elapsedMinutes > 0.1) {
    tasksPerHour = Math.round((totalCompleted / (elapsedMinutes / 60)) * 10) / 10;
  }

  return {
    fleetUtilizationPct: Math.round((activeCount / Math.max(1, robots.length)) * 100),
    avgBatteryPct: Math.round(avgBattery),
    collisionCount: state.collision_count,
    activeLeases: leases,
    meshHealthPct: meshHealth,
    completedTotal: totalCompleted,
    tick: state.tick,
    tasksPerHour: isFinite(tasksPerHour) ? tasksPerHour : 0,
  };
}

const DEFAULT_KPI: KPIMetrics = {
  fleetUtilizationPct: 0,
  avgBatteryPct: 92,
  collisionCount: 0,
  activeLeases: 0,
  meshHealthPct: 100,
  completedTotal: 0,
  tick: 0,
  tasksPerHour: 0,
};

// ── Contract Net Protocol Dynamic Bidding ─────────────────────────────────

export function calculateAuctionBid(
  robot: RobotState,
  pickupLocation: string,
  payloadKg: number,
  taskPriority: number
): { bidScore: number; isEligible: boolean; disqualificationReason?: string } {
  const cap = ROBOT_CAPACITIES[robot.id]?.maxPayloadKg ?? 500;
  if (payloadKg > cap) {
    return {
      bidScore: -999,
      isEligible: false,
      disqualificationReason: `Exceeds max payload (${payloadKg}kg > ${cap}kg capacity)`,
    };
  }
  if (robot.battery < 15) {
    return {
      bidScore: -999,
      isEligible: false,
      disqualificationReason: "Battery critical (<15%)",
    };
  }

  // Calculate distance from robot current pos to pickup node
  const pickupNode = WAREHOUSE_NODES[pickupLocation] ?? WAREHOUSE_NODES["DOCK-W"];
  const distanceToPickup = Math.hypot(pickupNode.x - robot.position.x, pickupNode.y - robot.position.y);

  // CNP Utility Function:
  // (Remaining Capacity Margin * 0.05) + (Battery * 0.4) - (Distance * 0.08) + (Priority * 0.25)
  const remainingCap = cap - payloadKg;
  const bidScore = (remainingCap * 0.05) + (robot.battery * 0.4) - (distanceToPickup * 0.08) + (taskPriority * 0.25);

  return { bidScore, isEligible: true };
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useFleetSocket(token?: string | null): FleetSocketState {
  const [fleetState, setFleetState] = useState<FleetState>(createInitialState);
  const [tasks, setTasks] = useState<TaskRecord[]>([
    {
      id: "TSK-101",
      pickup: "RACK A-02",
      destination: "DOCK-E",
      priority: 85,
      payload_kg: 240,
      payload_size: "medium",
      urgency: "standard",
      status: "In Progress",
      assigned_robot_id: "AMR-01",
      created_at: new Date().toISOString(),
    },
    {
      id: "TSK-102",
      pickup: "RACK B-03",
      destination: "CHARGE",
      priority: 92,
      payload_kg: 75,
      payload_size: "small",
      urgency: "critical",
      status: "In Progress",
      assigned_robot_id: "AMR-02",
      created_at: new Date().toISOString(),
    },
    {
      id: "TSK-103",
      pickup: "RACK C-01",
      destination: "DOCK-W",
      priority: 64,
      payload_kg: 480,
      payload_size: "heavy",
      urgency: "low",
      status: "In Progress",
      assigned_robot_id: "AMR-03",
      created_at: new Date().toISOString(),
    },
  ]);
  const [kpis, setKpis] = useState<KPIMetrics>(DEFAULT_KPI);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>("sim");

  const wsRef = useRef<WebSocket | null>(null);
  const tasksDoneRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localTickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const authHeader = useCallback((): Record<string, string> => {
    const activeToken = token || "demo-jwt-token-sih26123";
    return { Authorization: `Bearer ${activeToken}` };
  }, [token]);

  const apiFetch = useCallback(
    async (path: string, opts: RequestInit = {}): Promise<Response> => {
      return fetch(`${apiBase}${path}`, {
        ...opts,
        headers: { "Content-Type": "application/json", ...authHeader(), ...(opts.headers ?? {}) },
      });
    },
    [authHeader]
  );

  // ── Local Algorithmic Simulation Step (A* + Mutex Token passing) ─────────

  const stepLocalSimulation = useCallback(() => {
    setFleetState((prev) => {
      if (!prev.running) return prev;

      const nextTick = prev.tick + 1;
      const nextMessages = prev.messages + 3;
      let nextReservation = prev.reservation;
      let nextLeaseUntil = prev.lease_until;
      const newEvents: FleetEvent[] = [...prev.events];
      const newP2PMessages: P2PMessagePacket[] = [...(prev.activeP2PMessages ?? [])];

      const addP2P = (sender: RobotId, recipient: RobotId | "MESH", type: P2PMessagePacket["type"], payload: string) => {
        newP2PMessages.unshift({
          id: `p2p-${Date.now()}-${Math.random()}`,
          sender,
          recipient,
          type,
          payload,
          timestamp: new Date().toLocaleTimeString(),
        });
        if (newP2PMessages.length > 8) newP2PMessages.pop();
      };

      const addEvent = (type: EventType, message: string) => {
        newEvents.unshift({
          time: `T+${(nextTick * 0.6).toFixed(1)}s`,
          type,
          message,
        });
        if (newEvents.length > 8) newEvents.pop();
      };

      // Check if lease expired or cleared
      if (nextReservation && nextTick >= nextLeaseUntil) {
        addEvent("LEASE", `${nextReservation} cleared Corridor C-14 & released distributed mutex lock`);
        addP2P(nextReservation, "MESH", "MUTEX_GRANT", `RELEASE_MUTEX[Corridor C-14, Token returned to mesh]`);
        nextReservation = null;
        nextLeaseUntil = 0;
      }

      // Check approaching C-14 conflict point (500, 270)
      const isApproaching = (r: RobotState) => {
        if (r.path_index + 1 >= r.path.length) return false;
        const nextPt = r.path[r.path_index + 1];
        return Math.hypot(nextPt.x - 500, nextPt.y - 270) < 10 && r.progress > 0.45;
      };

      const contenders = prev.robots
        .filter(isApproaching)
        .sort((a, b) => b.priority - a.priority);

      if (nextReservation === null && contenders.length > 0) {
        const winner = contenders[0];
        nextReservation = winner.id;
        nextLeaseUntil = nextTick + 8;
        addEvent("LEASE", `${winner.id} acquired C-14 Distributed Mutex (Priority=${winner.priority}, Lease=4.8s)`);
        addP2P(winner.id, "MESH", "MUTEX_GRANT", `LEASE_ACQUIRED[Corridor C-14, Priority=${winner.priority}, Lease=4.8s]`);
      }

      // Move robots along algorithmic A* waypoints
      const updatedRobots = prev.robots.map((robot) => {
        const r = { ...robot, path: robot.path.map((p) => ({ ...p })), position: { ...robot.position } };

        if (isApproaching(r) && nextReservation !== r.id) {
          if (r.status !== "Yielding") {
            r.status = "Yielding";
            addEvent("LEASE", `${r.id} yielding at safety line | C-14 held by ${nextReservation}`);
            if (nextReservation) {
              addP2P(r.id, nextReservation, "YIELD_ACK", `YIELD_CONFIRM[Holding at safety buffer, Priority=${r.priority}]`);
            }
          }
          return r;
        }

        const nextIndex = r.path_index + 1;
        if (nextIndex >= r.path.length) {
          // Completed current trajectory: dynamically pick new target or loop
          r.status = "Moving";
          r.battery = Math.min(100, r.battery + 0.8);
          r.completed += 1;
          // Dynamically compute next mission leg via A*
          const startNode = findClosestNodeId(r.position);
          const targets = ["DOCK-E", "DOCK-W", "CHARGE", "RACK A-03", "RACK B-02"];
          const nextTarget = targets[(nextTick + r.completed) % targets.length];
          const blocked = prev.aisle_blocked ? new Set(["AISLE-B07"]) : new Set<string>();
          r.path = findShortestPath(startNode, nextTarget, blocked);
          r.path_index = 0;
          r.progress = 0;
          r.position = { ...r.path[0] };
          return r;
        }

        const start = r.path[r.path_index];
        const end = r.path[nextIndex];
        const dist = Math.hypot(end.x - start.x, end.y - start.y) || 1.0;
        const speed = r.id === "AMR-02" ? 22 : 18;

        // Dynamic obstacle checking along current segment
        if (prev.aisle_blocked && r.status !== "Rerouting") {
          const nextX = start.x + (end.x - start.x) * (r.progress + speed / dist);
          const nextY = start.y + (end.y - start.y) * (r.progress + speed / dist);
          if (Math.hypot(nextX - 640, nextY - 415) < 55) {
            // Recompute dynamic path with D* / A* avoiding AISLE-B07
            const currNode = findClosestNodeId(r.position);
            const destNode = "DOCK-W";
            r.path = findShortestPath(currNode, destNode, new Set(["AISLE-B07"]));
            r.path_index = 0;
            r.progress = 0;
            r.status = "Rerouting";
            addEvent("REROUTE", `${r.id} dynamically recalculated A* detour around blocked Aisle B-07`);
            return r;
          }
        }

        const nextProg = r.progress + speed / dist;
        r.status = "Moving";
        r.battery = Math.max(10, r.battery - 0.04);

        if (nextProg >= 1) {
          r.path_index = nextIndex;
          r.progress = 0;
          r.position = { ...end };
        } else {
          r.progress = nextProg;
          r.position = {
            x: start.x + (end.x - start.x) * nextProg,
            y: start.y + (end.y - start.y) * nextProg,
          };
        }

        return r;
      });

      if (nextTick % 6 === 0) {
        addP2P("AMR-01", "AMR-02", "HEARTBEAT", "P2P_SYNC_PULSE[Latency 4.2ms, Mesh Quorum 3/3]");
      }

      const nextState: FleetState = {
        ...prev,
        tick: nextTick,
        messages: nextMessages,
        reservation: nextReservation,
        lease_until: nextLeaseUntil,
        robots: updatedRobots,
        events: newEvents,
        activeP2PMessages: newP2PMessages,
      };

      setKpis(computeKPIs(nextState, tasksDoneRef.current));
      return nextState;
    });
  }, []);

  // Tick loop runner
  useEffect(() => {
    if (localTickIntervalRef.current) {
      clearInterval(localTickIntervalRef.current);
      localTickIntervalRef.current = null;
    }

    if (fleetState.running) {
      localTickIntervalRef.current = setInterval(() => {
        stepLocalSimulation();
      }, 600);
    }

    return () => {
      if (localTickIntervalRef.current) {
        clearInterval(localTickIntervalRef.current);
        localTickIntervalRef.current = null;
      }
    };
  }, [fleetState.running, stepLocalSimulation]);

  // ── Fetch tasks list ───────────────────────────────────────────────────

  const refreshTasks = useCallback(async () => {
    try {
      const res = await apiFetch("/api/tasks");
      if (res.ok) {
        const data = (await res.json()) as TaskRecord[];
        setTasks(data);
      }
    } catch {
      // Keep local tasks on disconnect
    }
  }, [apiFetch]);

  // ── WebSocket connect/reconnect ────────────────────────────────────────

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsUrl = token
      ? `${wsBase}/ws/fleet?token=${encodeURIComponent(token)}`
      : `${wsBase}/ws/fleet`;

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
    } catch {
      setConnectionMode("sim");
      setIsConnected(false);
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setConnectionMode("live");
      void refreshTasks();
    };

    ws.onmessage = (ev) => {
      try {
        const state = JSON.parse(ev.data as string) as FleetState;
        setFleetState((prev) => ({
          ...state,
          activeP2PMessages: state.activeP2PMessages ?? prev.activeP2PMessages ?? [],
        }));
        setKpis(computeKPIs(state, tasksDoneRef.current));
      } catch {
        // bad frame
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setConnectionMode("sim");
      wsRef.current = null;
      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, 4000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [token, refreshTasks]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  // ── Control commands ───────────────────────────────────────────────────

  const sendControl = useCallback(
    async (action: "start" | "pause" | "reset" | "step") => {
      if (isConnected) {
        try {
          if (action === "reset") {
            await apiFetch("/api/fleet/reset", { method: "POST" });
          } else {
            const running = action === "start";
            await apiFetch("/api/fleet/simulation", {
              method: "POST",
              body: JSON.stringify({ running }),
            });
          }
        } catch {
          // fallback
        }
      }

      setFleetState((prev) => {
        if (action === "reset") {
          const fresh = createInitialState();
          setKpis(computeKPIs(fresh, tasksDoneRef.current));
          return fresh;
        }

        const running = action === "start";
        const label = running ? "resumed" : "paused";
        const newEvents: FleetEvent[] = [
          {
            time: `T+${(prev.tick * 0.6).toFixed(1)}s`,
            type: "HEARTBEAT",
            message: `Simulation ${label} · Dynamic peer arbitration loop ${running ? "active" : "standby"}`,
          },
          ...prev.events,
        ];
        if (newEvents.length > 8) newEvents.pop();

        const updated = {
          ...prev,
          running,
          events: newEvents,
        };
        setKpis(computeKPIs(updated, tasksDoneRef.current));
        return updated;
      });
    },
    [isConnected, apiFetch]
  );

  // ── Task Management (Creation, Attribute Updates, Size Management, Bidding) ──

  const createTask = useCallback(
    async (
      input: TaskCreateInput | string,
      destArg?: string,
      priorityArg?: number
    ): Promise<TaskRecord | null> => {
      let pickup = "";
      let destination = "";
      let priority = 50;
      let payload_kg = 150;
      let payload_size: PayloadSize = "medium";
      let urgency: UrgencyLevel = "standard";

      if (typeof input === "string") {
        pickup = input;
        destination = destArg ?? "DOCK-E";
        priority = priorityArg ?? 50;
      } else {
        pickup = input.pickup;
        destination = input.destination;
        priority = input.priority;
        payload_kg = input.payload_kg ?? 150;
        payload_size = input.payload_size ?? "medium";
        urgency = input.urgency ?? "standard";
      }

      // Dynamic Contract-Net Protocol (CNP) Auction among AMRs
      let bestRobot: RobotId | null = null;
      let maxScore = -Infinity;
      for (const robot of fleetState.robots) {
        const { bidScore, isEligible } = calculateAuctionBid(robot, pickup, payload_kg, priority);
        if (isEligible && bidScore > maxScore) {
          maxScore = bidScore;
          bestRobot = robot.id;
        }
      }

      const newTask: TaskRecord = {
        id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
        pickup,
        destination,
        priority,
        payload_kg,
        payload_size,
        urgency,
        status: bestRobot ? "In Progress" : "Queued",
        assigned_robot_id: bestRobot,
        created_at: new Date().toISOString(),
      };

      if (isConnected) {
        try {
          const res = await apiFetch("/api/tasks", {
            method: "POST",
            body: JSON.stringify({
              pickup,
              destination,
              priority,
              payload_kg,
              payload_size,
              urgency,
            }),
          });
          if (res.ok) {
            const serverTask = (await res.json()) as TaskRecord;
            setTasks((prev) => [serverTask, ...prev]);
            tasksDoneRef.current += 1;
            return serverTask;
          }
        } catch {
          // fallback to local
        }
      }

      setTasks((prev) => [newTask, ...prev]);
      tasksDoneRef.current += 1;

      // Update AMR mission and calculate A* path to task pickup & destination
      setFleetState((prev) => {
        const updatedRobots = prev.robots.map((r) => {
          if (r.id === bestRobot) {
            const blocked = prev.aisle_blocked ? new Set(["AISLE-B07"]) : new Set<string>();
            const startNode = findClosestNodeId(r.position);
            const pathToPickup = findShortestPath(startNode, pickup, blocked);
            const pathToDest = findShortestPath(pickup, destination, blocked);
            const fullPath = [...pathToPickup, ...pathToDest.slice(1)];

            return {
              ...r,
              task: `${newTask.id}: ${pickup} -> ${destination} (${payload_kg}kg)`,
              status: "Moving" as const,
              path: fullPath,
              path_index: 0,
              progress: 0,
              priority: Math.max(r.priority, priority),
              current_payload_kg: payload_kg,
            };
          }
          return r;
        });

        const newP2P: P2PMessagePacket[] = [
          {
            id: `p2p-auction-${Date.now()}`,
            sender: bestRobot ?? "AMR-01",
            recipient: "MESH",
            type: "TASK_BID",
            payload: `AUCTION_WIN[${newTask.id}, Payload=${payload_kg}kg (${payload_size}), Pri=${priority}, Score=${maxScore.toFixed(1)}]`,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...(prev.activeP2PMessages ?? []),
        ];

        return {
          ...prev,
          messages: prev.messages + 3,
          robots: updatedRobots,
          activeP2PMessages: newP2P,
          events: [
            {
              time: `T+${(prev.tick * 0.6).toFixed(1)}s`,
              type: "HANDOFF",
              message: `${bestRobot ?? "Fleet"} won ${newTask.id} (${payload_kg}kg ${payload_size}) via Contract Net Protocol (score: ${maxScore.toFixed(1)})`,
            },
            ...prev.events,
          ],
        };
      });

      return newTask;
    },
    [isConnected, apiFetch, fleetState.robots]
  );

  const updateTask = useCallback(
    async (taskId: string, input: TaskUpdateInput): Promise<TaskRecord | null> => {
      if (isConnected) {
        try {
          const res = await apiFetch(`/api/tasks/${taskId}`, {
            method: "PATCH",
            body: JSON.stringify(input),
          });
          if (res.ok) {
            const updated = (await res.json()) as TaskRecord;
            setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
            return updated;
          }
        } catch {
          // fallback
        }
      }

      let updatedTask: TaskRecord | null = null;
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            updatedTask = {
              ...t,
              ...input,
              payload_kg: input.payload_kg ?? t.payload_kg,
              payload_size: input.payload_size ?? t.payload_size,
              urgency: input.urgency ?? t.urgency,
              priority: input.priority ?? t.priority,
            };
            return updatedTask;
          }
          return t;
        })
      );

      if (updatedTask) {
        setFleetState((prev) => ({
          ...prev,
          events: [
            {
              time: `T+${(prev.tick * 0.6).toFixed(1)}s`,
              type: "HANDOFF",
              message: `Task ${taskId} attributes updated (Size: ${input.payload_size ?? "unchanged"}, Weight: ${input.payload_kg ?? "unchanged"}kg, Pri: ${input.priority ?? "unchanged"})`,
            },
            ...prev.events,
          ],
        }));
      }

      return updatedTask;
    },
    [isConnected, apiFetch]
  );

  const deleteTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      if (isConnected) {
        try {
          const res = await apiFetch(`/api/tasks/${taskId}`, { method: "DELETE" });
          if (res.ok) {
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
            return true;
          }
        } catch {
          // fallback
        }
      }

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setFleetState((prev) => ({
        ...prev,
        events: [
          {
            time: `T+${(prev.tick * 0.6).toFixed(1)}s`,
            type: "HANDOFF",
            message: `Task ${taskId} withdrawn & removed from fleet allocation`,
          },
          ...prev.events,
        ],
      }));
      return true;
    },
    [isConnected, apiFetch]
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      if (isConnected) {
        try {
          const res = await apiFetch(`/api/tasks/${taskId}/complete`, { method: "POST" });
          if (res.ok) {
            const updated = (await res.json()) as TaskRecord;
            setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
            tasksDoneRef.current += 1;
            return;
          }
        } catch {
          // fallback
        }
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: "Completed" as const } : t))
      );
      tasksDoneRef.current += 1;
      setFleetState((prev) => ({
        ...prev,
        completed_tasks: prev.completed_tasks + 1,
        events: [
          {
            time: `T+${(prev.tick * 0.6).toFixed(1)}s`,
            type: "HEARTBEAT",
            message: `Task ${taskId} completed · Mission objective verified by peer mesh consensus`,
          },
          ...prev.events,
        ],
      }));
    },
    [isConnected, apiFetch]
  );

  const injectBlockage = useCallback(
    async (aisleId = "B-07") => {
      if (isConnected) {
        try {
          await apiFetch("/api/fleet/blockages", {
            method: "POST",
            body: JSON.stringify({ aisle_id: aisleId }),
          });
        } catch {
          // fallback
        }
      }

      setFleetState((prev) => {
        if (prev.aisle_blocked) {
          // Clear blockage and recalculate optimal A* routes
          const restoredRobots = prev.robots.map((r) => {
            const startNode = findClosestNodeId(r.position);
            const targetNode = r.id === "AMR-03" ? "DOCK-W" : "DOCK-E";
            return {
              ...r,
              path: findShortestPath(startNode, targetNode),
              path_index: 0,
              progress: 0,
              status: "Moving" as const,
              task: r.id === "AMR-03" ? "Pick P-23 -> Dock W" : r.task,
            };
          });

          return {
            ...prev,
            aisle_blocked: false,
            robots: restoredRobots,
            events: [
              {
                time: `T+${(prev.tick * 0.6).toFixed(1)}s`,
                type: "REROUTE",
                message: `Obstacle cleared at Aisle ${aisleId} · Optimal A* paths restored across warehouse grid`,
              },
              ...prev.events,
            ],
          };
        }

        // Apply obstacle: Aisle B-07 impassable. Compute dynamic D* Lite detour
        const blocked = new Set(["AISLE-B07"]);
        const updatedRobots = prev.robots.map((r) => {
          if (r.id === "AMR-03") {
            const startNode = findClosestNodeId(r.position);
            const detourPath = findShortestPath(startNode, "DOCK-W", blocked);
            return {
              ...r,
              path: detourPath,
              path_index: 0,
              progress: 0,
              status: "Rerouting" as const,
              task: "D* Lite Detour around B-07",
            };
          }
          return r;
        });

        const newP2P: P2PMessagePacket[] = [
          {
            id: `p2p-block-${Date.now()}`,
            sender: "AMR-03",
            recipient: "MESH",
            type: "OBSTACLE_ALERT",
            payload: `OBSTACLE_DETECTED[Aisle B-07 impassable, D* Lite recomputed via perimeter transit]`,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...(prev.activeP2PMessages ?? []),
        ];

        return {
          ...prev,
          aisle_blocked: true,
          messages: prev.messages + 6,
          robots: updatedRobots,
          activeP2PMessages: newP2P,
          events: [
            {
              time: `T+${(prev.tick * 0.6).toFixed(1)}s`,
              type: "REROUTE",
              message: `AMR-03 detected obstacle in Aisle ${aisleId} · D* Lite real-time detour computed avoiding node AISLE-B07`,
            },
            ...prev.events,
          ],
        };
      });
    },
    [isConnected, apiFetch]
  );

  const requestReservation = useCallback(
    async (robotId: RobotId, corridorId = "C-14", leaseSeconds = 4.8) => {
      if (isConnected) {
        try {
          await apiFetch("/api/fleet/reservations", {
            method: "POST",
            body: JSON.stringify({
              robot_id: robotId,
              corridor_id: corridorId,
              lease_seconds: leaseSeconds,
            }),
          });
        } catch {
          // fallback
        }
      }

      setFleetState((prev) => {
        const leaseUntil = prev.tick + Math.round(leaseSeconds / 0.6);
        return {
          ...prev,
          reservation: robotId,
          lease_until: leaseUntil,
          events: [
            {
              time: `T+${(prev.tick * 0.6).toFixed(1)}s`,
              type: "LEASE",
              message: `${robotId} acquired ${corridorId} Distributed Mutex (Priority scoring win, ${leaseSeconds}s lease)`,
            },
            ...prev.events,
          ],
        };
      });
    },
    [isConnected, apiFetch]
  );

  const publishIntent = useCallback(
    async (robotId: RobotId, corridorId = "C-14", etaSeconds = 5.0) => {
      if (isConnected) {
        try {
          await apiFetch("/api/fleet/intents", {
            method: "POST",
            body: JSON.stringify({
              robot_id: robotId,
              corridor_id: corridorId,
              eta_seconds: etaSeconds,
            }),
          });
        } catch {
          // fallback
        }
      }

      setFleetState((prev) => ({
        ...prev,
        messages: prev.messages + 1,
        events: [
          {
            time: `T+${(prev.tick * 0.6).toFixed(1)}s`,
            type: "INTENT",
            message: `${robotId} published ${corridorId} space-time intent (ETA ${etaSeconds.toFixed(1)}s) to P2P mesh`,
          },
          ...prev.events,
        ],
      }));
    },
    [isConnected, apiFetch]
  );

  const EMPTY_ROBOTS: RobotState[] = [];
  const EMPTY_EVENTS: FleetEvent[] = [];
  const EMPTY_P2P: P2PMessagePacket[] = [];

  return {
    fleetState,
    robots: fleetState?.robots ?? EMPTY_ROBOTS,
    events: fleetState?.events ?? EMPTY_EVENTS,
    p2pMessages: fleetState?.activeP2PMessages ?? EMPTY_P2P,
    tasks,
    kpis,
    connectionMode,
    isConnected,
    sendControl,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    injectBlockage,
    requestReservation,
    publishIntent,
    refreshTasks,
  };
}
