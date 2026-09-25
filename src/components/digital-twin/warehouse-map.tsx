import type { P2PMessagePacket, RobotId, RobotState, World, WorldNode } from "@/lib/fleet-contract";
import { RobotMarker } from "@/components/digital-twin/robot-marker";

interface WarehouseMapProps {
  /** Topology from GET /api/world. Nothing on this map is drawn from constants. */
  world: World | null;
  robots: RobotState[];
  /** mutex zone id -> robot currently holding its lease */
  leases: Record<string, RobotId>;
  blockedNodes: string[];
  p2p?: P2PMessagePacket[];
  showRadar?: boolean;
  showHeatmap?: boolean;
  showP2PBeams?: boolean;
  onSelectRobot?: (robot: RobotState) => void;
  style?: React.CSSProperties;
  className?: string;
}

const BEAM_COLORS: Record<string, string> = {
  YIELD_ACK: "#F59E0B",
  MUTEX_REQ: "#A855F7",
  MUTEX_GRANT: "#A855F7",
  OBSTACLE_ALERT: "#EF4444",
  TASK_BID: "#06B6D4",
  HEARTBEAT: "#64748B",
};

const PAD = 70;

function polyline(points: { x: number; y: number }[]) {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

export function WarehouseMap({
  world,
  robots,
  leases,
  blockedNodes,
  p2p = [],
  showRadar = true,
  showHeatmap = false,
  showP2PBeams = true,
  onSelectRobot,
  style,
  className,
}: WarehouseMapProps) {
  if (!world) {
    return (
      <svg className={`warehouse-svg-canvas ${className ?? ""}`.trim()} style={style} viewBox="0 0 1000 600" role="img" aria-label="Warehouse floor map">
        <rect width="1000" height="600" fill="var(--map-floor)" />
        <text x="500" y="300" textAnchor="middle" fill="var(--text-muted)" fontSize="14" fontFamily="var(--font-mono)">
          No live floor data yet. Sign in and make sure the fleet backend is running.
        </text>
      </svg>
    );
  }

  const nodes = new Map<string, WorldNode>(world.nodes.map((n) => [n.id, n]));
  const xs = world.nodes.map((n) => n.x);
  const ys = world.nodes.map((n) => n.y);
  const minX = Math.min(...xs) - PAD;
  const minY = Math.min(...ys) - PAD;
  const width = Math.max(...xs) + PAD - minX;
  const height = Math.max(...ys) + PAD - minY;

  const racks = world.nodes.filter((n) => n.type === "rack");
  const bays = world.nodes.filter((n) => n.type === "dock" || n.type === "charge");
  const yard = world.nodes.filter((n) => n.type === "transit" || n.type === "corridor");
  const zones = world.mutex_zones.map((id) => nodes.get(id)).filter((n): n is WorldNode => Boolean(n));
  const byId = new Map(robots.map((r) => [r.id, r]));

  const beams = showP2PBeams
    ? p2p
        .filter((m) => m.recipient !== "MESH" && byId.has(m.sender) && byId.has(m.recipient))
        .slice(0, 6)
    : [];
  const congested = robots.filter((r) => r.status === "Yielding" || r.status === "Blocked");

  return (
    <svg
      className={`warehouse-svg-canvas ${className ?? ""}`.trim()}
      style={style}
      viewBox={`${minX} ${minY} ${width} ${height}`}
      role="img"
      aria-label="Live warehouse digital twin floor map"
    >
      <defs>
        <pattern id="floor-grid-pattern" width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M 25 0 L 0 0 0 25" fill="none" stroke="var(--map-grid)" strokeWidth="0.75" opacity="0.6" />
          <circle cx="0" cy="0" r="0.7" fill="var(--map-grid)" opacity="0.8" />
        </pattern>
        <pattern id="hazard-stripes" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="10" stroke="var(--map-hazard-stripe-1, #D97706)" strokeWidth="4" />
          <line x1="5" y1="0" x2="5" y2="10" stroke="var(--map-hazard-stripe-2, var(--map-floor))" strokeWidth="4" />
        </pattern>
        <linearGradient id="radar-beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--status-active)" stopOpacity="0.0" />
          <stop offset="70%" stopColor="var(--status-active)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--status-active)" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="traffic-heat" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--status-warning)" stopOpacity="0.4" />
          <stop offset="60%" stopColor="var(--status-warning)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--status-warning)" stopOpacity="0.0" />
        </radialGradient>
      </defs>

      <rect x={minX} y={minY} width={width} height={height} fill="var(--map-floor)" />
      <rect x={minX + 10} y={minY + 10} width={width - 20} height={height - 20} fill="url(#floor-grid-pattern)" stroke="var(--map-floor-border)" strokeWidth="1" rx="4" />

      {/* Congestion: where robots are actually waiting right now */}
      {showHeatmap && (
        <g style={{ pointerEvents: "none" }}>
          {congested.map((r) => (
            <circle key={r.id} cx={r.position.x} cy={r.position.y} r="80" fill="url(#traffic-heat)" />
          ))}
        </g>
      )}

      {/* LiDAR sweep visual centred on the first mutex zone */}
      {showRadar && zones[0] && (
        <g style={{ pointerEvents: "none" }}>
          <circle cx={zones[0].x} cy={zones[0].y} r="320" fill="none" stroke="var(--status-active)" strokeWidth="0.8" opacity="0.15" strokeDasharray="4 6" />
          <circle cx={zones[0].x} cy={zones[0].y} r="160" fill="none" stroke="var(--status-active)" strokeWidth="0.6" opacity="0.1" />
          <line
            x1={zones[0].x}
            y1={zones[0].y}
            x2={zones[0].x + 320}
            y2={zones[0].y}
            stroke="url(#radar-beam-gradient)"
            strokeWidth="2"
            className="animate-radar-sweep"
            style={{ transformOrigin: `${zones[0].x}px ${zones[0].y}px` }}
          />
        </g>
      )}

      {/* Lanes: one line per graph edge */}
      <g fill="none" stroke="var(--map-lane)" strokeLinecap="round">
        {world.edges.map(([a, b]) => {
          const from = nodes.get(a);
          const to = nodes.get(b);
          if (!from || !to) return null;
          return (
            <g key={`${a}|${b}`}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} strokeWidth="12" opacity="0.14" />
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} strokeWidth="1" strokeDasharray="3 5" opacity="0.7" />
            </g>
          );
        })}
      </g>

      {/* Racks */}
      <g fill="var(--map-rack)" stroke="var(--map-rack-stroke)" strokeWidth="1">
        {racks.map((n) => (
          <rect key={n.id} x={n.x - 48} y={n.y - 24} width="96" height="48" rx="3">
            <title>{n.label}</title>
          </rect>
        ))}
      </g>
      <g fill="var(--map-rack-text)" stroke="none" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
        {racks.map((n) => {
          const [id, tag] = n.label.split(" [");
          return (
            <text key={n.id} x={n.x} y={n.y - 2} fontSize="9.5" letterSpacing="0.04em">
              {id}
              {tag && (
                <tspan x={n.x} dy="12" fontSize="8" opacity="0.8">
                  {tag.replace("]", "")}
                </tspan>
              )}
            </text>
          );
        })}
      </g>

      {/* Docks & charging bay */}
      <g fill="var(--map-dock)" stroke="var(--border-tactical)" strokeWidth="1">
        {bays.map((n) => (
          <rect key={n.id} x={n.x - 70} y={n.y - 16} width="140" height="32" rx="3" />
        ))}
      </g>
      <g stroke="none" fontSize="8.5" fontWeight="800" fontFamily="var(--font-mono)" textAnchor="middle">
        {bays.map((n) => (
          <text key={n.id} x={n.x} y={n.y + 3} fill={n.type === "charge" ? "var(--status-active)" : "var(--map-dock-text)"}>
            {n.label}
          </text>
        ))}
      </g>

      {/* Junctions / waypoints */}
      <g>
        {yard.map((n) => {
          const isZone = world.mutex_zones.includes(n.id);
          const hold = /hold/i.test(n.label);
          return (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={isZone ? 0 : 4.5} fill="var(--bg-surface)" stroke="var(--map-lane)" strokeWidth="1.2">
                <title>{n.label}</title>
              </circle>
              {hold && (
                <text x={n.x} y={n.y - 9} textAnchor="middle" fill="var(--map-hold-line)" fontSize="7.5" fontWeight="800" fontFamily="var(--font-mono)">
                  {n.label.replace(/\s*\(.*\)/, "")} HOLD
                </text>
              )}
            </g>
          );
        })}
      </g>

      {/* Mutex zones: box, hazard-striped hold lines on every approach, live lease holder */}
      {zones.map((zone) => {
        const holder = leases[zone.id];
        const approaches = world.edges
          .filter(([a, b]) => a === zone.id || b === zone.id)
          .map(([a, b]) => nodes.get(a === zone.id ? b : a))
          .filter((n): n is WorldNode => Boolean(n));
        return (
          <g key={zone.id}>
            {approaches.map((n) => {
              const dx = n.x - zone.x;
              const dy = n.y - zone.y;
              const len = Math.hypot(dx, dy) || 1;
              const hx = zone.x + (dx / len) * 62;
              const hy = zone.y + (dy / len) * 62;
              const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
              return (
                <g key={n.id} transform={`translate(${hx} ${hy}) rotate(${angle})`}>
                  <rect x="-4" y="-32" width="8" height="64" fill="url(#hazard-stripes)" rx="1" />
                  <rect x="-4" y="-32" width="8" height="64" fill="none" stroke="var(--map-hold-line)" strokeWidth="1" />
                </g>
              );
            })}
            <rect
              x={zone.x - 55}
              y={zone.y - 45}
              width="110"
              height="90"
              rx="6"
              fill={holder ? "var(--status-active-tint)" : "var(--bg-surface)"}
              stroke={holder ? "var(--status-active)" : "var(--border-tactical)"}
              strokeWidth={holder ? 2 : 1.5}
            />
            {holder && <circle cx={zone.x} cy={zone.y} r="42" fill="none" stroke="var(--status-active)" className="animate-pulse-ring" strokeWidth="1.5" />}
            <text x={zone.x} y={zone.y - 20} textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="800" fontFamily="var(--font-mono)">
              {zone.label}
            </text>
            <text x={zone.x} y={zone.y - 4} textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontWeight="700" fontFamily="var(--font-mono)">
              MUTEX SINGLE-LANE
            </text>
            <rect
              x={zone.x - 35}
              y={zone.y + 6}
              width="70"
              height="16"
              rx="3"
              fill={holder ? "var(--status-active)" : "var(--bg-elevated)"}
              stroke={holder ? "var(--status-active)" : "var(--border-tactical)"}
            />
            <text x={zone.x} y={zone.y + 18} textAnchor="middle" fill={holder ? "var(--primary-foreground)" : "var(--text-secondary)"} fontSize="8.5" fontWeight="800" fontFamily="var(--font-mono)">
              {holder ? `[HOLD: ${holder}]` : "OPEN // IDLE"}
            </text>
          </g>
        );
      })}

      {/* Planned trajectories: current position -> remaining waypoints */}
      {robots.map((r) => {
        const remaining = [r.position, ...r.path.slice(r.path_index + 1)];
        return remaining.length > 1 ? (
          <polyline key={`path-${r.id}`} points={polyline(remaining)} fill="none" stroke={r.color} strokeWidth="2.5" className="animated-flow-path" opacity="0.85" />
        ) : null;
      })}

      {/* Real inter-robot packets (latest exchanges only) */}
      {beams.map((m) => {
        const a = byId.get(m.sender)!;
        const b = byId.get(m.recipient)!;
        return (
          <line
            key={m.id}
            x1={a.position.x}
            y1={a.position.y}
            x2={b.position.x}
            y2={b.position.y}
            stroke={BEAM_COLORS[m.type] ?? "#A855F7"}
            strokeWidth="1.6"
            strokeDasharray="4 4"
            className="animated-flow-path"
            opacity="0.65"
            style={{ pointerEvents: "none" }}
          />
        );
      })}

      {/* Blocked nodes reported by the backend */}
      {blockedNodes.map((id) => {
        const n = nodes.get(id);
        if (!n) return null;
        return (
          <g key={id}>
            <rect x={n.x - 30} y={n.y - 15} width="60" height="30" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" rx="4" />
            <circle cx={n.x} cy={n.y} r="22" fill="none" stroke="#EF4444" className="animate-pulse-ring" />
            <circle cx={n.x} cy={n.y} r="18" fill="var(--bg-surface)" stroke="#EF4444" strokeWidth="2" />
            <path d={`M ${n.x - 8} ${n.y - 8} L ${n.x + 8} ${n.y + 8} M ${n.x + 8} ${n.y - 8} L ${n.x - 8} ${n.y + 8}`} stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
            <rect x={n.x - 75} y={n.y + 22} width="150" height="15" rx="3" fill="var(--bg-surface)" stroke="#EF4444" strokeWidth="0.8" />
            <text x={n.x} y={n.y + 33} textAnchor="middle" fill="#EF4444" fontSize="8" fontWeight="800" fontFamily="var(--font-mono)">
              {n.label.replace(/\s*\[.*\]/, "").toUpperCase()} BLOCKED
            </text>
          </g>
        );
      })}

      {/* AMRs (click to inspect) */}
      {robots.map((robot) => (
        <g key={robot.id} onClick={() => onSelectRobot?.(robot)} style={{ cursor: "pointer" }}>
          <title>{`Click to inspect ${robot.id} (${robot.name}) telemetry`}</title>
          <RobotMarker robot={robot} />
        </g>
      ))}
    </svg>
  );
}
