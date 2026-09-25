"use client";

import { Activity, Wifi } from "lucide-react";
import { useFleetSocket } from "@/lib/use-fleet-socket";

/** Peer packets exchanged per control tick, sampled from the coordinator's real message counter. */
export function LiveTelemetryChart({ isRunning, messages = 0 }: { isRunning: boolean; messages?: number }) {
  const { history, world } = useFleetSocket();
  const samples = history.messageRate.slice(-30);
  const period = world?.config.control_period_s ?? 0.6;
  const latest = samples[samples.length - 1] ?? 0;
  const peak = Math.max(1, ...samples);
  const perSecond = latest / period;

  const width = 280;
  const height = 40;
  const step = samples.length > 1 ? width / (samples.length - 1) : width;
  const points = samples.map((v, i) => `${(i * step).toFixed(1)},${(height - (v / peak) * height).toFixed(1)}`).join(" ");

  return (
    <div className="glass-panel" style={{ borderRadius: 8, padding: "12px 16px", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Activity className="w-4 h-4" style={{ color: "var(--solar-terracotta)" }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>Peer Packet Rate</div>
          <div className="font-mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {isRunning ? `${latest} / tick · ${perSecond.toFixed(1)} / s` : "paused"} &middot; {messages} total
          </div>
        </div>
      </div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Peer packets per tick">
        {samples.length > 1 && <polyline points={points} fill="none" stroke="var(--solar-terracotta)" strokeWidth="2" strokeLinejoin="round" />}
      </svg>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
        <Wifi className="w-3.5 h-3.5" />
        <span>peak {peak} / tick</span>
      </div>
    </div>
  );
}
