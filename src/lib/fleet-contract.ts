export type RobotId = "AMR-01" | "AMR-02" | "AMR-03";

export type Point = { x: number; y: number };

export type RobotState = {
  id: RobotId;
  name: string;
  color: string;
  battery: number;
  status: "Moving" | "Yielding" | "Rerouting" | "Task handoff" | "Charging";
  task: string;
  priority: number;
  path: Point[];
  path_index: number;
  progress: number;
  position: Point;
  completed: number;
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
  assigned_robot_id: RobotId | null;
  created_at: string;
};

export const DEFAULT_ROUTES: Record<RobotId, Point[]> = {
  "AMR-01": [{ x: 102, y: 270 }, { x: 350, y: 270 }, { x: 500, y: 270 }, { x: 720, y: 270 }, { x: 900, y: 270 }],
  "AMR-02": [{ x: 500, y: 85 }, { x: 500, y: 180 }, { x: 500, y: 270 }, { x: 500, y: 444 }, { x: 500, y: 540 }],
  "AMR-03": [{ x: 900, y: 453 }, { x: 720, y: 453 }, { x: 650, y: 390 }, { x: 500, y: 390 }, { x: 280, y: 390 }, { x: 102, y: 390 }],
};

export const DEFAULT_DETOUR: Point[] = [
  { x: 900, y: 453 },
  { x: 720, y: 453 },
  { x: 720, y: 505 },
  { x: 280, y: 505 },
  { x: 102, y: 390 },
];

export const initialFleetState: SimulationState = {
  tick: 0,
  running: false,
  aisle_blocked: false,
  reservation: null,
  lease_until: 0,
  completed_tasks: 33,
  collision_count: 0,
  messages: 142,
  events: [
    { time: "T+00.0s", type: "HEARTBEAT", message: "Mesh online | 3 peers discovered | direct local links healthy" },
    { time: "T+00.6s", type: "INTENT", message: "AMR-01 broadcast Corridor C-14 traversal intent (ETA 4.2s)" },
    { time: "T+01.2s", type: "LEASE", message: "Corridor C-14 lease granted to AMR-01 [Utility: 84.2 vs AMR-03: 62.1]" },
  ],
  robots: [
    {
      id: "AMR-01",
      name: "Atlas",
      color: "#10B981",
      battery: 82,
      status: "Moving",
      task: "Pick P-17 -> Dock E",
      priority: 71,
      path: DEFAULT_ROUTES["AMR-01"],
      path_index: 0,
      progress: 0.15,
      position: { x: 140, y: 270 },
      completed: 12,
    },
    {
      id: "AMR-02",
      name: "Nova",
      color: "#F59E0B",
      battery: 48,
      status: "Moving",
      task: "Replenish R-04",
      priority: 91,
      path: DEFAULT_ROUTES["AMR-02"],
      path_index: 0,
      progress: 0.2,
      position: { x: 500, y: 120 },
      completed: 10,
    },
    {
      id: "AMR-03",
      name: "Kiva",
      color: "#38BDF8",
      battery: 67,
      status: "Yielding",
      task: "Pick P-23 -> Dock W",
      priority: 63,
      path: DEFAULT_ROUTES["AMR-03"],
      path_index: 0,
      progress: 0.1,
      position: { x: 860, y: 453 },
      completed: 11,
    },
  ],
};

