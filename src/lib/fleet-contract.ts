export type RobotId = "AMR-01" | "AMR-02" | "AMR-03";

export type FleetId = "all" | "alpha" | "beta" | "gamma";

export type Point = { x: number; y: number };

export type RobotState = {
  id: RobotId;
  name: string;
  color: string;
  battery: number;
  status: "Idle" | "Moving" | "Yielding" | "Rerouting" | "Task handoff" | "Charging" | "Blocked";
  task: string;
  priority: number;
  path: Point[];
  path_index: number;
  progress: number;
  position: Point;
  completed: number;
  fleet_id?: "alpha" | "beta" | "gamma";
  robot_class?: string;
  payload_capacity_kg?: number;
  max_speed_mps?: number;
};

export type FleetMetadata = {
  id: "alpha" | "beta" | "gamma";
  name: string;
  role: string;
  zone: string;
  color: string;
  robotCount: number;
  totalPayloadKg: number;
};

export const FLEET_PROFILES: Record<"alpha" | "beta" | "gamma", FleetMetadata> = {
  alpha: {
    id: "alpha",
    name: "Fleet Alpha · Heavy Pallet",
    role: "Heavy Pallet & Bulk Cargo Transport (ISO 3691-4 High Inertia)",
    zone: "Zone A-02 (High-Bay Staging)",
    color: "#10B981",
    robotCount: 2,
    totalPayloadKg: 2000,
  },
  beta: {
    id: "beta",
    name: "Fleet Beta · Agile Picker",
    role: "High-Frequency Bin Picking & Mutex Zone Crossing",
    zone: "Zone B-04 (Corridor C-14 Mutex Spine)",
    color: "#F59E0B",
    robotCount: 1,
    totalPayloadKg: 350,
  },
  gamma: {
    id: "gamma",
    name: "Fleet Gamma · Autonomous Tug",
    role: "Perimeter Hauling & Dynamic Detouring (D* Lite Real-time)",
    zone: "Zone C-01 (Highway Perimeter)",
    color: "#06B6D4",
    robotCount: 1,
    totalPayloadKg: 600,
  },
};

export type FleetEvent = {
  time: string;
  type: "LEASE" | "INTENT" | "REROUTE" | "HANDOFF" | "HEARTBEAT";
  message: string;
};

export type SimulationState = {
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
};

export type TaskRecord = {
  id: string;
  pickup: string;
  destination: string;
  priority: number;
  status: "Queued" | "Assigned" | "In Progress" | "Completed" | "Blocked";
  payload_kg?: number;
  payload_size?: "small" | "medium" | "heavy" | "pallet";
  urgency?: "low" | "standard" | "critical";
  assigned_robot_id: RobotId | null;
  created_at: string;
};

