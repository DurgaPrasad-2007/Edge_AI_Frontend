import type { RobotState } from "@/lib/fleet-contract";

export function RobotMarker({ robot }: { robot: RobotState }) {
  const isYielding = robot.status === "Yielding";
  const isRerouting = robot.status === "Rerouting";
  const isBlocked = robot.status === "Blocked";
  const isCharging = robot.status === "Charging";
  const isHalted = isYielding || isBlocked;

  return (
    <g
      transform={`translate(${robot.position.x} ${robot.position.y})`}
      style={{
        transition: isHalted ? "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)" : "transform 0.6s linear",
        willChange: "transform",
      }}
    >
      {/* ISO 3691-4 Protective Safety Clearance Ring (0.5m scaled buffer) */}
      <circle
        r={isHalted ? "20" : "24"}
        fill={isBlocked ? "rgba(239, 68, 68, 0.15)" : isYielding ? "var(--status-warning)" : robot.color}
        fillOpacity={isBlocked ? "0.2" : isYielding ? "0.15" : "0.08"}
        stroke={isBlocked ? "#EF4444" : isYielding ? "var(--status-warning)" : robot.color}
        strokeWidth={isHalted ? "1.8" : "1.2"}
        strokeDasharray={isHalted ? "2 2" : "4 4"}
        style={{ transition: "all 0.3s ease" }}
      />

      {/* Directional LiDAR Scan Sweep */}
      <g style={{ transformOrigin: "0px 0px", opacity: isHalted ? 0 : 1, transition: "opacity 0.25s ease", pointerEvents: isHalted ? "none" : "auto" }}>
        <path d="M 0 0 L 28 -12 A 32 32 0 0 1 28 12 Z" fill={robot.color} fillOpacity="0.22" />
        <line x1="0" y1="0" x2="30" y2="0" stroke={robot.color} strokeWidth="1.4" opacity="0.85" />
        <circle cx="30" cy="0" r="2.2" fill={robot.color} />
      </g>

      {/* Industrial AMR Chassis */}
      <rect
        x="-16"
        y="-12"
        width="32"
        height="24"
        rx="4"
        fill="var(--bg-surface)"
        stroke={isBlocked ? "#EF4444" : isYielding ? "var(--status-warning)" : robot.color}
        strokeWidth={isHalted ? "2.2" : "2"}
        style={{ transition: "all 0.3s ease" }}
      />

      {/* Direction Arrow or Pause Bar */}
      {isHalted ? (
        <g fill={isBlocked ? "#EF4444" : "var(--status-warning)"}>
          <rect x="-4" y="-5" width="3" height="10" rx="1" />
          <rect x="1" y="-5" width="3" height="10" rx="1" />
        </g>
      ) : (
        <polygon points="-3,-4 5,0 -3,4" fill={robot.color} />
      )}

      {/* Optical wheel indicator accents */}
      <rect x="-14" y="-14" width="7" height="2.5" fill="var(--text-muted)" rx="1" />
      <rect x="7" y="-14" width="7" height="2.5" fill="var(--text-muted)" rx="1" />
      <rect x="-14" y="11.5" width="7" height="2.5" fill="var(--text-muted)" rx="1" />
      <rect x="7" y="11.5" width="7" height="2.5" fill="var(--text-muted)" rx="1" />

      {/* Robot Status Pill above the robot */}
      {isBlocked && (
        <g transform="translate(0, -23)">
          {/* Solid underlay prevents floor grid from bleeding through text */}
          <rect
            x="-64"
            y="-9"
            width="128"
            height="16"
            rx="4"
            fill="var(--bg-surface)"
          />
          <rect
            x="-64"
            y="-9"
            width="128"
            height="16"
            rx="4"
            fill="rgba(239, 68, 68, 0.18)"
            stroke="#EF4444"
            strokeWidth="1.2"
          />
          <text
            x="0"
            y="2.5"
            textAnchor="middle"
            fill="#EF4444"
            fontSize="7.5"
            fontWeight="800"
            fontFamily="var(--font-mono)"
            letterSpacing="0.03em"
          >
            [STOPPED // NO ROUTE]
          </text>
        </g>
      )}

      {isYielding && !isBlocked && (
        <g transform="translate(0, -23)">
          <rect
            x="-54"
            y="-9"
            width="108"
            height="16"
            rx="4"
            fill="var(--bg-surface)"
          />
          <rect
            x="-54"
            y="-9"
            width="108"
            height="16"
            rx="4"
            fill="var(--status-warning-tint)"
            stroke="var(--status-warning)"
            strokeWidth="1.2"
          />
          <text
            x="0"
            y="2.5"
            textAnchor="middle"
            fill="var(--status-warning)"
            fontSize="7.5"
            fontWeight="800"
            fontFamily="var(--font-mono)"
            letterSpacing="0.03em"
          >
            [HOLD // YIELDING]
          </text>
        </g>
      )}

      {isRerouting && (
        <g transform="translate(0, -23)">
          <rect
            x="-46"
            y="-9"
            width="92"
            height="16"
            rx="4"
            fill="var(--bg-surface)"
          />
          <rect
            x="-46"
            y="-9"
            width="92"
            height="16"
            rx="4"
            fill="var(--status-active-tint)"
            stroke="var(--status-active)"
            strokeWidth="1.2"
          />
          <text
            x="0"
            y="2.5"
            textAnchor="middle"
            fill="var(--status-active)"
            fontSize="7.5"
            fontWeight="800"
            fontFamily="var(--font-mono)"
            letterSpacing="0.03em"
          >
            [A* RE-ROUTE]
          </text>
        </g>
      )}

      {isCharging && (
        <g transform="translate(0, -23)">
          <rect
            x="-42"
            y="-9"
            width="84"
            height="16"
            rx="4"
            fill="var(--bg-surface)"
          />
          <rect
            x="-42"
            y="-9"
            width="84"
            height="16"
            rx="4"
            fill="var(--status-active-tint)"
            stroke="var(--status-active)"
            strokeWidth="1.2"
          />
          <text
            x="0"
            y="2.5"
            textAnchor="middle"
            fill="var(--status-active)"
            fontSize="7.5"
            fontWeight="800"
            fontFamily="var(--font-mono)"
            letterSpacing="0.03em"
          >
            [CHARGING]
          </text>
        </g>
      )}

      {/* Robot Monospace Tag Below Chassis */}
      <g transform="translate(0, 20)">
        <rect
          x="-27"
          y="0"
          width="54"
          height="15"
          rx="3"
          fill="var(--bg-surface)"
          stroke="var(--border-tactical)"
          strokeWidth="0.8"
        />
        <text
          x="0"
          y="10.5"
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize="8.5"
          fontWeight="700"
          fontFamily="var(--font-mono)"
        >
          {robot.id}
        </text>
      </g>
    </g>

  );
}
