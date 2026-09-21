import type { RobotId, RobotState } from "@/lib/fleet-contract";
import { RobotMarker } from "@/components/digital-twin/robot-marker";

interface WarehouseMapProps {
  robots: RobotState[];
  reservation: RobotId | null;
  aisleBlocked: boolean;
  showRadar?: boolean;
  showHeatmap?: boolean;
  onSelectRobot?: (robot: RobotState) => void;
}

export function WarehouseMap({
  robots,
  reservation,
  aisleBlocked,
  showRadar = true,
  showHeatmap = false,
  onSelectRobot,
}: WarehouseMapProps) {
  const activePath = (points: { x: number; y: number }[]) =>
    points.map((p) => `${p.x},${p.y}`).join(" ");

  const r1 = robots.find((r) => r.id === "AMR-01");
  const r2 = robots.find((r) => r.id === "AMR-02");
  const r3 = robots.find((r) => r.id === "AMR-03");

  return (
    <svg
      className="warehouse-svg-canvas"
      viewBox="0 0 1000 600"
      role="img"
      aria-label="High-Fidelity 2D Warehouse Digital Twin Floor Map"
    >
      <defs>
        {/* Floor Grid Pattern */}
        <pattern id="floor-grid-pattern" width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M 25 0 L 0 0 0 25" fill="none" stroke="var(--map-grid)" strokeWidth="0.75" opacity="0.6" />
          <circle cx="0" cy="0" r="0.7" fill="var(--map-grid)" opacity="0.8" />
        </pattern>

        {/* Hazard Stripes Pattern for Hold Lines */}
        <pattern id="hazard-stripes" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="10" stroke="var(--map-hazard-stripe-1, #D97706)" strokeWidth="4" />
          <line x1="5" y1="0" x2="5" y2="10" stroke="var(--map-hazard-stripe-2, var(--map-floor))" strokeWidth="4" />
        </pattern>

        {/* Dynamic Radar Beam Linear Gradient */}
        <linearGradient id="radar-beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--status-active)" stopOpacity="0.0" />
          <stop offset="70%" stopColor="var(--status-active)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--status-active)" stopOpacity="0.9" />
        </linearGradient>

        {/* Traffic Heatmap Gradient */}
        <radialGradient id="traffic-heat-c14" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--status-warning)" stopOpacity="0.35" />
          <stop offset="60%" stopColor="var(--status-warning)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--status-warning)" stopOpacity="0.0" />
        </radialGradient>
      </defs>

      {/* Floor Canvas Background */}
      <rect width="1000" height="600" fill="var(--map-floor)" />
      <rect x="20" y="20" width="960" height="560" fill="url(#floor-grid-pattern)" stroke="var(--map-floor-border)" strokeWidth="1" rx="4" />

      {/* Optional Traffic Congestion Heatmap */}
      {showHeatmap && (
        <g style={{ pointerEvents: "none" }}>
          <circle cx="500" cy="270" r="140" fill="url(#traffic-heat-c14)" />
          <circle cx="370" cy="380" r="90" fill="url(#traffic-heat-c14)" />
          <circle cx="740" cy="490" r="90" fill="url(#traffic-heat-c14)" />
        </g>
      )}

      {/* Continuous 360 LiDAR / Radar Sweep Beam */}
      {showRadar && (
        <g style={{ pointerEvents: "none" }}>
          <circle cx="500" cy="270" r="320" fill="none" stroke="var(--status-active)" strokeWidth="0.8" opacity="0.15" strokeDasharray="4 6" />
          <circle cx="500" cy="270" r="160" fill="none" stroke="var(--status-active)" strokeWidth="0.6" opacity="0.1" />
          <line
            x1="500"
            y1="270"
            x2="820"
            y2="270"
            stroke="url(#radar-beam-gradient)"
            strokeWidth="2"
            className="animate-radar-sweep"
            style={{ transformOrigin: "500px 270px" }}
          />
        </g>
      )}

      {/* Racks & Shelves — High Bay Aisles */}
      <g fill="var(--map-rack)" stroke="var(--map-rack-stroke)" strokeWidth="1">
        {/* Row 1 Racks */}
        <rect x="40" y="40" width="200" height="70" rx="3" />
        <text x="140" y="80" textAnchor="middle" fill="var(--map-rack-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
          RACK A-01 [BULK]
        </text>

        <rect x="280" y="40" width="180" height="70" rx="3" />
        <text x="370" y="80" textAnchor="middle" fill="var(--map-rack-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
          RACK A-02 [PARTS]
        </text>

        <rect x="540" y="40" width="180" height="70" rx="3" />
        <text x="630" y="80" textAnchor="middle" fill="var(--map-rack-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
          RACK A-03 [FAST]
        </text>

        <rect x="760" y="40" width="200" height="70" rx="3" />
        <text x="860" y="80" textAnchor="middle" fill="var(--map-rack-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
          RACK A-04 [RESERVE]
        </text>

        {/* Row 2 Racks */}
        <rect x="40" y="140" width="200" height="75" rx="3" />
        <text x="140" y="182" textAnchor="middle" fill="var(--map-rack-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
          RACK B-01 [AVIONICS]
        </text>

        <rect x="280" y="140" width="180" height="75" rx="3" />
        <text x="370" y="182" textAnchor="middle" fill="var(--map-rack-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
          RACK B-02 [ASSEMBLY]
        </text>

        <rect x="540" y="140" width="180" height="75" rx="3" />
        <text x="630" y="182" textAnchor="middle" fill="var(--map-rack-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
          RACK B-03 [HARNESS]
        </text>

        <rect x="760" y="140" width="200" height="75" rx="3" />
        <text x="860" y="182" textAnchor="middle" fill="var(--map-rack-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
          RACK B-04 [OPTICS]
        </text>

        {/* Row 3 Racks */}
        <rect x="40" y="325" width="200" height="75" rx="3" />
        <text x="140" y="367" textAnchor="middle" fill="var(--map-rack-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
          RACK C-01 [STAGING]
        </text>

        <rect x="280" y="325" width="180" height="75" rx="3" />
        <text x="370" y="367" textAnchor="middle" fill="var(--map-rack-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
          RACK C-02 [FINISHED]
        </text>

        <rect x="540" y="325" width="180" height="75" rx="3" />
        <text x="630" y="367" textAnchor="middle" fill="var(--map-rack-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
          RACK C-03 [BUFFER]
        </text>

        <rect x="760" y="325" width="200" height="75" rx="3" />
        <text x="860" y="367" textAnchor="middle" fill="var(--map-rack-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
          RACK C-04 [PACKAGING]
        </text>

        {/* Row 4 Racks */}
        <rect x="40" y="440" width="200" height="70" rx="3" />
        <text x="140" y="480" textAnchor="middle" fill="var(--map-rack-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
          RACK D-01 [RETURNS]
        </text>

        <rect x="280" y="440" width="180" height="70" rx="3" />
        <text x="370" y="480" textAnchor="middle" fill="var(--map-rack-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
          RACK D-02 [PALLETS]
        </text>

        <rect x="540" y="440" width="180" height="70" rx="3" />
        <text x="630" y="480" textAnchor="middle" fill="var(--map-rack-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
          RACK D-03 [BUFFER]
        </text>

        <rect x="760" y="440" width="200" height="70" rx="3" />
        <text x="860" y="480" textAnchor="middle" fill="var(--map-rack-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
          RACK D-04 [RECYCLE]
        </text>
      </g>

      {/* Orthogonal AGV Highway Network */}
      <g stroke="var(--map-lane)" strokeWidth="1" strokeDasharray="3 5" opacity="0.6">
        <path d="M 40 270 L 960 270" />
        <path d="M 500 40 L 500 560" />
        <path d="M 40 415 L 960 415" />
        <path d="M 720 415 L 720 505 L 280 505 L 280 415" />
      </g>

      {/* Facility Docks & Charging Station */}
      <g fill="var(--map-dock)" stroke="var(--border-tactical)" strokeWidth="1">
        <rect x="40" y="525" width="160" height="36" rx="3" />
        <text x="120" y="547" textAnchor="middle" fill="var(--map-dock-text)" fontSize="8.5" fontWeight="700" fontFamily="var(--font-mono)">
          DOCK-WEST [OUTBOUND]
        </text>

        <rect x="800" y="525" width="160" height="36" rx="3" />
        <text x="880" y="547" textAnchor="middle" fill="var(--map-dock-text)" fontSize="8.5" fontWeight="700" fontFamily="var(--font-mono)">
          DOCK-EAST [INBOUND]
        </text>

        <rect x="420" y="525" width="160" height="36" rx="3" />
        <text x="500" y="547" textAnchor="middle" fill="var(--status-active)" fontSize="8.5" fontWeight="700" fontFamily="var(--font-mono)">
          CHARGING BAY [3 SLOTS]
        </text>
      </g>

      {/* Robot Planned Trajectories with Dynamic Flow Animation */}
      {r1 && (
        <polyline
          points={activePath(r1.path)}
          fill="none"
          stroke={r1.color}
          strokeWidth="2.5"
          className="animated-flow-path"
          opacity="0.85"
        />
      )}
      {r2 && (
        <polyline
          points={activePath(r2.path)}
          fill="none"
          stroke={r2.color}
          strokeWidth="2.5"
          className="animated-flow-path"
          opacity="0.85"
        />
      )}
      {r3 && (
        <polyline
          points={activePath(r3.path)}
          fill="none"
          stroke={r3.color}
          strokeWidth="2.5"
          className="animated-flow-path"
          opacity="0.85"
        />
      )}

      {/* =========================================================================
         CORRIDOR C-14 CHOKEPOINT & EXPLICIT SAFETY HOLD LINES
         ========================================================================= */}

      {/* North Hold Line for AMR-02 */}
      <g>
        <rect x="460" y="174" width="80" height="8" fill="url(#hazard-stripes)" rx="1" />
        <rect x="460" y="174" width="80" height="8" fill="none" stroke="var(--map-hold-line)" strokeWidth="1" />
        <text x="500" y="168" textAnchor="middle" fill="var(--map-hold-line)" fontSize="8" fontWeight="800" fontFamily="var(--font-mono)">
          HOLD LINE N-14 (WAIT HERE IF C-14 LEASED)
        </text>
      </g>

      {/* West Hold Line for AMR-01 */}
      <g>
        <rect x="406" y="235" width="8" height="70" fill="url(#hazard-stripes)" rx="1" />
        <rect x="406" y="235" width="8" height="70" fill="none" stroke="var(--map-hold-line)" strokeWidth="1" />
        <text
          x="398"
          y="273"
          textAnchor="end"
          fill="var(--map-hold-line)"
          fontSize="8"
          fontWeight="800"
          fontFamily="var(--font-mono)"
        >
          HOLD LINE W-14
        </text>
      </g>

      {/* Corridor C-14 Central Mutual Exclusion Box (Solar Dusk Theme) */}
      <g>
        <rect
          x="445"
          y="225"
          width="110"
          height="90"
          rx="6"
          fill={reservation ? "var(--status-active-tint)" : "var(--bg-surface)"}
          stroke={reservation ? "var(--status-active)" : "var(--border-tactical)"}
          strokeWidth={reservation ? "2" : "1.5"}
        />

        {/* Pulse ring when leased */}
        {reservation && (
          <circle cx="500" cy="270" r="42" fill="none" stroke="var(--status-active)" className="animate-pulse-ring" strokeWidth="1.5" />
        )}

        <text
          x="500"
          y="250"
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize="11"
          fontWeight="800"
          fontFamily="var(--font-mono)"
        >
          CORRIDOR C-14
        </text>

        <text
          x="500"
          y="266"
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize="8"
          fontWeight="700"
          fontFamily="var(--font-mono)"
        >
          MUTEX SINGLE-LANE
        </text>

        <rect
          x="465"
          y="276"
          width="70"
          height="16"
          rx="3"
          fill={reservation ? "var(--status-active)" : "var(--bg-elevated)"}
          stroke={reservation ? "var(--status-active)" : "var(--border-tactical)"}
          strokeWidth="1"
        />
        <text
          x="500"
          y="288"
          textAnchor="middle"
          fill={reservation ? "var(--primary-foreground)" : "var(--text-secondary)"}
          fontSize="8.5"
          fontWeight="800"
          fontFamily="var(--font-mono)"
        >
          {reservation ? `🔒 ${reservation}` : "OPEN // IDLE"}
        </text>
      </g>

      {/* Injected Blockage at Aisle B-07 with Expanding Alert Pulse */}
      {aisleBlocked && (
        <g>
          {/* Shaded obstacle zone over Aisle B-07 */}
          <rect x="610" y="400" width="60" height="30" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" rx="4" />
          <circle cx="640" cy="415" r="22" fill="none" stroke="#EF4444" className="animate-pulse-ring" />
          <circle
            cx="640"
            cy="415"
            r="18"
            fill="var(--bg-surface)"
            stroke="#EF4444"
            strokeWidth="2"
          />
          <path d="M 632 407 L 648 423 M 648 407 L 632 423" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="570" y="437" width="140" height="15" rx="3" fill="var(--bg-surface)" stroke="#EF4444" strokeWidth="0.8" />
          <text
            x="640"
            y="448"
            textAnchor="middle"
            fill="#EF4444"
            fontSize="8"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            AISLE B-07 BLOCKED
          </text>
        </g>
      )}

      {/* Active AMR Markers (Clickable for Telemetry HUD Inspection) */}
      {robots.map((robot) => (
        <g
          key={robot.id}
          onClick={() => onSelectRobot && onSelectRobot(robot)}
          style={{ cursor: "pointer" }}
        >
          <title>{`Click to inspect ${robot.id} (${robot.name}) Telemetry HUD`}</title>
          <RobotMarker robot={robot} />
        </g>
      ))}
    </svg>
  );
}
