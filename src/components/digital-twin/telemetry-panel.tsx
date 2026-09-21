import type { RobotId, RobotState } from "@/lib/fleet-contract";
import { Battery, ShieldCheck, ChevronRight, Activity } from "lucide-react";

interface TelemetryPanelProps {
  robots: RobotState[];
  reservation: RobotId | null;
  selectedRobotId?: RobotId | null;
  onSelectRobot?: (robot: RobotState) => void;
}

export function TelemetryPanel({
  robots,
  reservation,
  selectedRobotId,
  onSelectRobot,
}: TelemetryPanelProps) {
  const leaseHolder = robots.find((r) => r.id === reservation);

  return (
    <div className="simulator-sidebar">
      {/* 1. Conflict Cell C-14 Lease State */}
      <div className="sidebar-panel">
        <div className="sidebar-panel-title">
          <span>Corridor Mutex (C-14)</span>
          <span className={`badge ${reservation ? "badge-danger" : "badge-nominal"}`}>
            {reservation ? "LEASED" : "OPEN"}
          </span>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-tactical)",
            borderRadius: 6,
            padding: "10px 12px",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Lease Holder
            </span>
            <strong className="font-mono" style={{ fontSize: 12, color: reservation ? "var(--status-danger)" : "var(--status-nominal)" }}>
              {leaseHolder ? `${leaseHolder.id} (${leaseHolder.name})` : "Uncontested"}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Arbiter Policy
            </span>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--text-secondary)" }}>
              Safety &gt; Priority &gt; Battery
            </span>
          </div>
        </div>

        <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
          {reservation
            ? `${leaseHolder?.name} holds the exclusive single-lane space-time lease. Neighboring AMRs yield at waypoint WP-04/09 until exit.`
            : "Intersection is unoccupied. Approaching AMRs broadcast spatial intent over peer mesh to acquire a bounded traversal lease."}
        </p>
      </div>

      {/* 2. Onboard Telemetry Cards (Interactive Inspection) */}
      <div className="sidebar-panel">
        <div className="sidebar-panel-title">
          <span>Onboard AMR Telemetry</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>Click to Inspect</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {robots.map((r) => {
            const isMoving = r.status === "Moving";
            const isYielding = r.status === "Yielding";
            const isDetour = r.status === "Rerouting";
            const isSelected = selectedRobotId === r.id;

            return (
              <div
                key={r.id}
                onClick={() => onSelectRobot && onSelectRobot(r)}
                className="interactive-card"
                style={{
                  background: "var(--bg-surface)",
                  border: isSelected ? `2px solid ${r.color}` : "1px solid var(--border-tactical)",
                  borderRadius: 6,
                  padding: "10px 12px",
                  boxShadow: isSelected ? "var(--shadow-card)" : "none",
                }}
                role="button"
                tabIndex={0}
                aria-label={`Inspect ${r.id} ${r.name}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onSelectRobot && onSelectRobot(r);
                  }
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: r.color,
                      }}
                    />
                    <strong className="font-mono" style={{ fontSize: 12, color: "var(--text-primary)" }}>
                      {r.id}
                    </strong>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>({r.name})</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span
                      className={`badge ${
                        isMoving ? "badge-nominal" : isYielding ? "badge-warning" : isDetour ? "badge-danger" : "badge-active"
                      }`}
                      style={{ fontSize: 10, padding: "2px 6px" }}
                    >
                      {r.status}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Task: <span className="font-mono">{r.task}</span>
                </div>

                {/* Battery Bar with Numerical Indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                  <Battery className="w-3.5 h-3.5 text-slate-500" />
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      backgroundColor: "var(--bg-muted)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.round(r.battery)}%`,
                        height: "100%",
                        backgroundColor:
                          r.battery > 50
                            ? "var(--status-nominal)"
                            : r.battery > 25
                            ? "var(--status-warning)"
                            : "var(--status-danger)",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                  <span className="mono-metric" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>
                    {Math.round(r.battery)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Safety Envelope Verification */}
      <div className="sidebar-panel">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck className="w-4 h-4" style={{ color: "var(--solar-terracotta)" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
            ISO 3691-4:2023 Safety
          </span>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.4, margin: 0 }}>
          0.5m dynamic personnel envelope active. Zero-motion observer API cannot override onboard emergency stop loops.
        </p>
      </div>
    </div>
  );
}
