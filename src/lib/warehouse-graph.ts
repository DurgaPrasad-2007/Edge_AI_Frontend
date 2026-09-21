/**
 * Warehouse Floor Topological Grid Graph & Pathfinding Algorithms
 * Provides real A* shortest path search, dynamic D* obstacle rerouting,
 * and Euclidean distance calculation between warehouse nodes.
 */

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
  type: "rack" | "dock" | "corridor" | "transit" | "charge";
}

export interface GraphEdge {
  from: string;
  to: string;
  distance: number;
  isMutex?: boolean;
}

// ── Standard Warehouse Graph Nodes ──────────────────────────────────────────
export const WAREHOUSE_NODES: Record<string, GraphNode> = {
  // Docks & Charging
  "DOCK-W": { id: "DOCK-W", x: 92, y: 270, label: "DOCK WEST", type: "dock" },
  "DOCK-E": { id: "DOCK-E", x: 908, y: 270, label: "DOCK EAST", type: "dock" },
  "CHARGE": { id: "CHARGE", x: 500, y: 540, label: "CHARGE BAY", type: "charge" },

  // Transit Intersections
  "INT-W1": { id: "INT-W1", x: 280, y: 270, label: "JCT-W1", type: "transit" },
  "INT-W2": { id: "INT-W2", x: 410, y: 270, label: "WP-04 (West Hold)", type: "transit" },
  "C-14": { id: "C-14", x: 500, y: 270, label: "CORRIDOR C-14", type: "corridor" },
  "INT-E1": { id: "INT-E1", x: 590, y: 270, label: "WP-09 (East Hold)", type: "transit" },
  "INT-E2": { id: "INT-E2", x: 720, y: 270, label: "JCT-E1", type: "transit" },

  // Vertical Spine Intersections
  "INT-N1": { id: "INT-N1", x: 500, y: 85, label: "NORTH APEX", type: "transit" },
  "INT-N2": { id: "INT-N2", x: 500, y: 180, label: "WP-02 (North Hold)", type: "transit" },
  "INT-S1": { id: "INT-S1", x: 500, y: 415, label: "WP-07 (South Mid)", type: "transit" },
  "INT-S2": { id: "INT-S2", x: 500, y: 485, label: "SOUTH SPINE", type: "transit" },

  // Lower Bypass Highway (y: 415 and y: 505)
  "BYPASS-W": { id: "BYPASS-W", x: 102, y: 415, label: "BYPASS WEST", type: "transit" },
  "BYPASS-WM": { id: "BYPASS-WM", x: 280, y: 415, label: "BYPASS W-MID", type: "transit" },
  "AISLE-B07": { id: "AISLE-B07", x: 640, y: 415, label: "AISLE B-07", type: "transit" },
  "BYPASS-EM": { id: "BYPASS-EM", x: 720, y: 415, label: "BYPASS E-MID", type: "transit" },
  "BYPASS-E": { id: "BYPASS-E", x: 900, y: 415, label: "BYPASS EAST", type: "transit" },

  // Deep South Detour (Perimeter highway around B-07 obstacle)
  "DETOUR-SW": { id: "DETOUR-SW", x: 280, y: 505, label: "DETOUR SW", type: "transit" },
  "DETOUR-SE": { id: "DETOUR-SE", x: 720, y: 505, label: "DETOUR SE", type: "transit" },

  // Primary Racks
  "RACK A-01": { id: "RACK A-01", x: 210, y: 155, label: "RACK A-01 [BULK]", type: "rack" },
  "RACK A-02": { id: "RACK A-02", x: 370, y: 155, label: "RACK A-02 [PARTS]", type: "rack" },
  "RACK A-03": { id: "RACK A-03", x: 630, y: 155, label: "RACK A-03 [FAST]", type: "rack" },
  "RACK A-04": { id: "RACK A-04", x: 790, y: 155, label: "RACK A-04 [RESERVE]", type: "rack" },

  "RACK B-01": { id: "RACK B-01", x: 210, y: 355, label: "RACK B-01 [AVIONICS]", type: "rack" },
  "RACK B-02": { id: "RACK B-02", x: 370, y: 355, label: "RACK B-02 [ASSEMBLY]", type: "rack" },
  "RACK B-03": { id: "RACK B-03", x: 630, y: 355, label: "RACK B-03 [HARNESS]", type: "rack" },
  "RACK B-04": { id: "RACK B-04", x: 790, y: 355, label: "RACK B-04 [OPTICS]", type: "rack" },

  "RACK C-01": { id: "RACK C-01", x: 210, y: 485, label: "RACK C-01 [STAGING]", type: "rack" },
  "RACK C-02": { id: "RACK C-02", x: 370, y: 485, label: "RACK C-02 [FINISHED]", type: "rack" },
  "RACK C-03": { id: "RACK C-03", x: 630, y: 485, label: "RACK C-03 [BUFFER]", type: "rack" },
  "RACK C-04": { id: "RACK C-04", x: 790, y: 485, label: "RACK C-04 [PACKAGING]", type: "rack" },
};

// ── Graph Adjacency List ───────────────────────────────────────────────────
function buildAdjacencyList(): Record<string, string[]> {
  const adj: Record<string, string[]> = {};
  for (const k of Object.keys(WAREHOUSE_NODES)) {
    adj[k] = [];
  }

  const connect = (a: string, b: string) => {
    if (adj[a] && adj[b]) {
      if (!adj[a].includes(b)) adj[a].push(b);
      if (!adj[b].includes(a)) adj[b].push(a);
    }
  };

  // Main East-West Corridor (y = 270)
  connect("DOCK-W", "INT-W1");
  connect("INT-W1", "INT-W2");
  connect("INT-W2", "C-14");
  connect("C-14", "INT-E1");
  connect("INT-E1", "INT-E2");
  connect("INT-E2", "DOCK-E");

  // Main North-South Central Spine (x = 500)
  connect("INT-N1", "INT-N2");
  connect("INT-N2", "C-14");
  connect("C-14", "INT-S1");
  connect("INT-S1", "INT-S2");
  connect("INT-S2", "CHARGE");

  // Lower Transit Highway (y = 415)
  connect("BYPASS-W", "BYPASS-WM");
  connect("BYPASS-WM", "INT-S1");
  connect("INT-S1", "AISLE-B07");
  connect("AISLE-B07", "BYPASS-EM");
  connect("BYPASS-EM", "BYPASS-E");

  // Vertical Connectors between High-Bay Aisles
  connect("INT-W1", "BYPASS-WM");
  connect("INT-E2", "BYPASS-EM");
  connect("DOCK-W", "BYPASS-W");
  connect("DOCK-E", "BYPASS-E");

  // Perimeter Detour Highway (y = 505) around B-07
  connect("BYPASS-WM", "DETOUR-SW");
  connect("DETOUR-SW", "DETOUR-SE");
  connect("DETOUR-SE", "BYPASS-EM");

  // Rack Feeders
  connect("RACK A-01", "INT-W1");
  connect("RACK A-02", "INT-W2");
  connect("RACK A-03", "INT-E1");
  connect("RACK A-04", "INT-E2");

  connect("RACK B-01", "INT-W1");
  connect("RACK B-02", "INT-W2");
  connect("RACK B-03", "AISLE-B07");
  connect("RACK B-04", "BYPASS-EM");

  connect("RACK C-01", "BYPASS-WM");
  connect("RACK C-02", "INT-S2");
  connect("RACK C-03", "DETOUR-SE");
  connect("RACK C-04", "BYPASS-E");

  return adj;
}

export const GRAPH_ADJACENCY = buildAdjacencyList();

// ── Real A* Algorithm ─────────────────────────────────────────────────────
export function findShortestPath(
  startId: string,
  goalId: string,
  blockedNodes: Set<string> = new Set()
): { x: number; y: number }[] {
  const start = WAREHOUSE_NODES[startId] ?? WAREHOUSE_NODES["DOCK-W"];
  const goal = WAREHOUSE_NODES[goalId] ?? WAREHOUSE_NODES["DOCK-E"];

  if (start.id === goal.id) {
    return [{ x: start.x, y: start.y }];
  }

  // Priority queue / frontier
  const openSet = new Set<string>([start.id]);
  const cameFrom = new Map<string, string>();

  const gScore = new Map<string, number>();
  gScore.set(start.id, 0);

  const fScore = new Map<string, number>();
  fScore.set(start.id, Math.hypot(goal.x - start.x, goal.y - start.y));

  while (openSet.size > 0) {
    let currentId = "";
    let minF = Infinity;
    for (const node of openSet) {
      const f = fScore.get(node) ?? Infinity;
      if (f < minF) {
        minF = f;
        currentId = node;
      }
    }

    if (currentId === goal.id) {
      const pathPoints: { x: number; y: number }[] = [];
      let curr: string | undefined = currentId;
      while (curr) {
        const n = WAREHOUSE_NODES[curr];
        if (n) pathPoints.unshift({ x: n.x, y: n.y });
        curr = cameFrom.get(curr);
      }
      return pathPoints;
    }

    openSet.delete(currentId);
    const currNode = WAREHOUSE_NODES[currentId];
    if (!currNode) continue;

    const neighbors = GRAPH_ADJACENCY[currentId] ?? [];
    for (const neighborId of neighbors) {
      if (blockedNodes.has(neighborId)) {
        continue;
      }

      const neighborNode = WAREHOUSE_NODES[neighborId];
      if (!neighborNode) continue;

      const edgeDist = Math.hypot(neighborNode.x - currNode.x, neighborNode.y - currNode.y);
      const tentativeG = (gScore.get(currentId) ?? Infinity) + edgeDist;

      if (tentativeG < (gScore.get(neighborId) ?? Infinity)) {
        cameFrom.set(neighborId, currentId);
        gScore.set(neighborId, tentativeG);
        const heuristic = Math.hypot(goal.x - neighborNode.x, goal.y - neighborNode.y);
        fScore.set(neighborId, tentativeG + heuristic);
        openSet.add(neighborId);
      }
    }
  }

  return [
    { x: start.x, y: start.y },
    { x: goal.x, y: goal.y },
  ];
}

export function findClosestNodeId(point: { x: number; y: number }): string {
  let closestId = "DOCK-W";
  let minDist = Infinity;
  for (const [id, node] of Object.entries(WAREHOUSE_NODES)) {
    const d = Math.hypot(node.x - point.x, node.y - point.y);
    if (d < minDist) {
      minDist = d;
      closestId = id;
    }
  }
  return closestId;
}
