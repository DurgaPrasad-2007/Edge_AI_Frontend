import type { RobotState } from "@/lib/fleet-contract";

export function RobotMarker({ robot }: { robot: RobotState }) {
  const isYielding = robot.status === "Yielding";
  const isRerouting = robot.status === "Rerouting";

  return (
    <g transform={`translate(${robot.position.x} ${robot.position.y})`} style={{ transition: "transform 0.55s ease-out" }}>
      {/* ISO 3691-4 Protective Safety Clearance Ring (0.5m scaled buffer) */}
      <circle
        r={isYielding ? "20" : "24"}
        fill={isYielding ? "#F59E0B" : robot.color}
        fillOpacity={isYielding ? "0.15" : "0.08"}
        stroke={isYielding ? "#F59E0B" : robot.color}
        strokeWidth={isYielding ? "1.8" : "1.2"}
        strokeDasharray={isYielding ? "2 2" : "4 4"}
      />

      {/* Directional LiDAR Scan Sweep */}
      {!isYielding && (
        <g style={{ transformOrigin: "0px 0px" }}>
          <path d="M 0 0 L 28 -12 A 32 32 0 0 1 28 12 Z" fill={robot.color} fillOpacity="0.22" />
          <line x1="0" y1="0" x2="30" y2="0" stroke={robot.color} strokeWidth="1.4" opacity="0.85" />
          <circle cx="30" cy="0" r="2.2" fill={robot.color} />
        </g>
      )}

      {/* Industrial AMR Chassis */}
      <rect
        x="-16"
        y="-12"
        width="32"
        height="24"
        rx="4"
        fill="var(--bg-surface)"
        stroke={isYielding ? "#F59E0B" : robot.color}
        strokeWidth={isYielding ? "2.2" : "2"}
      />

      {/* Direction Arrow or Pause Bar */}
      {isYielding ? (
        <g fill="#F59E0B">
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
      {isYielding && (
        <g transform="translate(0, -22)">
          <rect
            x="-38"
            y="-8"
            width="76"
            height="14"
            rx="3"
            fill="#FEF3C7"
            stroke="#F59E0B"
            strokeWidth="1"
          />
          <text
            x="0"
            y="2.5"
            textAnchor="middle"
            fill="#92400E"
            fontSize="8"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            ⏳ YIELDING
          </text>
        </g>
      )}

      {isRerouting && (
        <g transform="translate(0, -22)">
          <rect
            x="-44"
            y="-8"
            width="88"
            height="14"
            rx="3"
            fill="#EFF6FF"
            stroke="#3B82F6"
            strokeWidth="1"
          />
          <text
            x="0"
            y="2.5"
            textAnchor="middle"
            fill="#1E40AF"
            fontSize="8"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            🔄 D* RE-ROUTE
          </text>
        </g>
      )}

      {/* Robot Monospace Tag Below Chassis */}
      <g transform="translate(0, 20)">
        <rect
          x="-24"
          y="0"
          width="48"
          height="14"
          rx="3"
          fill="var(--bg-surface)"
          stroke="var(--border-tactical)"
          strokeWidth="0.8"
        />
        <text
          x="0"
          y="10"
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize="9"
          fontWeight="700"
          fontFamily="var(--font-mono)"
        >
          {robot.id}
        </text>
      </g>
    </g>
  );
}
