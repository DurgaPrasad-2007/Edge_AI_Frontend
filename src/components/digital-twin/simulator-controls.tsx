"use client";

import { Play, Pause, RotateCcw, AlertTriangle, Radio, Flame } from "lucide-react";
import type { RobotState } from "@/lib/fleet-contract";

interface SimulatorControlsProps {
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
  onInjectBlockage: () => void;
  aisleBlocked: boolean;
  robots: RobotState[];
  showRadar?: boolean;
  onToggleRadar?: () => void;
  showHeatmap?: boolean;
  onToggleHeatmap?: () => void;
  /** e.g. "Aisle B-07" — the obstacle the inject button toggles */
  aisleLabel?: string;
  /** true while the backend is unreachable: commands cannot be sent */
  disabled?: boolean;
}

export function SimulatorControls({
  isRunning,
  onToggleRunning,
  onReset,
  onInjectBlockage,
  aisleBlocked,
  robots,
  showRadar = true,
  onToggleRadar,
  showHeatmap = false,
  onToggleHeatmap,
  aisleLabel = "Aisle",
  disabled = false,
}: SimulatorControlsProps) {
  return (
    <div className="simulator-toolbar" role="toolbar" aria-label="Floor Simulation Controls">
      {/* Fleet Swatches / Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        {robots.map((r) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: r.color,
                display: "inline-block",
              }}
            />
            <span className="font-mono" style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              {r.id}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: 11 }}>[{r.name}]</span>
          </div>
        ))}
      </div>

      {/* Layer Toggles & Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {/* Radar Toggle */}
        {onToggleRadar && (
          <button
            type="button"
            onClick={onToggleRadar}
            className={`btn ${showRadar ? "btn-active-toggle" : "btn-secondary"}`}
            style={{ padding: "5px 10px", fontSize: 11 }}
            title="Toggle 360 Radar Sweep Beam"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Radar Sweep</span>
          </button>
        )}

        {/* Traffic Heatmap Toggle */}
        {onToggleHeatmap && (
          <button
            type="button"
            onClick={onToggleHeatmap}
            className={`btn ${showHeatmap ? "btn-active-toggle" : "btn-secondary"}`}
            style={{ padding: "5px 10px", fontSize: 11 }}
            title="Highlight where AMRs are currently waiting"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Congestion</span>
          </button>
        )}

        {/* Reset Floor */}
        <button
          type="button"
          onClick={onReset}
          className="btn btn-secondary"
          style={{ padding: "6px 12px", fontSize: 12 }}
          title="Return robots to their docks and requeue in-flight tasks"
          disabled={disabled}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Floor
        </button>

        {/* Inject Blockage */}
        <button
          type="button"
          onClick={onInjectBlockage}
          className={`btn ${aisleBlocked ? "btn-secondary" : "btn-danger"}`}
          style={{ padding: "6px 12px", fontSize: 12 }}
          title={`Block ${aisleLabel} to force a real A* replan`}
          disabled={disabled}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          {aisleBlocked ? "Clear Obstacle" : `Block ${aisleLabel}`}
        </button>

        {/* Run / Pause */}
        <button
          type="button"
          onClick={onToggleRunning}
          className={`btn ${isRunning ? "btn-secondary" : "btn-primary"}`}
          style={{ padding: "6px 14px", fontSize: 12 }}
          disabled={disabled}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause Fleet
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Run Fleet
            </>
          )}
        </button>
      </div>
    </div>
  );
}
