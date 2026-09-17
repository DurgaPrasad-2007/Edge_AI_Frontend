"use client";

import { useState, useEffect } from "react";
import { Activity, Wifi, ShieldCheck, Zap } from "lucide-react";

export function LiveTelemetryChart({ isRunning }: { isRunning: boolean }) {
  const [latencyHistory, setLatencyHistory] = useState<number[]>([
    42, 45, 41, 48, 52, 44, 46, 43, 50, 47, 42, 44, 49, 43, 41,
  ]);
  const [currentLatency, setCurrentLatency] = useState(44);
  const [packetRate, setPacketRate] = useState(20);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Simulate real-time ROS 2 / Zenoh peer latency (38ms - 68ms)
      const jitter = Math.floor(Math.random() * 18) - 9;
      const nextLat = Math.max(34, Math.min(76, 46 + jitter));
      setCurrentLatency(nextLat);
      setLatencyHistory((prev) => [...prev.slice(1), nextLat]);
      setPacketRate(18 + Math.floor(Math.random() * 5));
    }, 600);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Construct SVG Polyline coordinates (Width: 320, Height: 44)
  const minLat = 30;
  const maxLat = 80;
  const width = 280;
  const height = 40;
  const step = width / (latencyHistory.length - 1);

  const points = latencyHistory
    .map((lat, idx) => {
      const x = idx * step;
      const y = height - ((lat - minLat) / (maxLat - minLat)) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: 8,
        padding: "12px 16px",
        marginTop: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      {/* Metric 1: Decision Latency + Sparkline */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            <Activity className="w-3.5 h-3.5 text-blue-600 animate-live-dot" />
            <span>P2P Consensus Latency</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
            <span className="mono-metric" style={{ fontSize: 20, fontWeight: 800, color: "var(--status-active)" }}>
              {currentLatency}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>ms (P95)</span>
          </div>
        </div>

        {/* Real-time Animated Sparkline */}
        <div style={{ width: 140, height: 32, display: "flex", alignItems: "center" }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%", overflow: "visible" }}>
            <polyline
              points={points}
              fill="none"
              stroke="var(--status-active)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: "all 0.4s ease" }}
            />
            {/* Animated current point */}
            {latencyHistory.length > 0 && (
              <circle
                cx={width}
                cy={height - ((currentLatency - minLat) / (maxLat - minLat)) * height}
                r="3.5"
                fill="var(--status-active)"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Metric 2: Peer Mesh Packet Frequency */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Wifi className="w-4 h-4 text-emerald-600" />
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            ROS 2 / Zenoh Rate
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 2 }}>
            <span className="mono-metric" style={{ fontSize: 16, fontWeight: 800, color: "var(--status-nominal)" }}>
              {packetRate}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Hz (Broadcast)</span>
          </div>
        </div>
      </div>

      {/* Metric 3: Zero-Motion Safety Boundary */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
          SIL-2 Non-Motion Observer Active
        </span>
      </div>
    </div>
  );
}
