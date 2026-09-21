import { Cpu, Zap, HardDrive, Wifi, Shield } from "lucide-react";

export function BenchmarkSection() {
  return (
    <section id="benchmarks" className="content-section" style={{ paddingTop: 40, paddingBottom: 40 }}>
      {/* 21st.dev Section Header with Two-Tone Display Headline */}
      <div className="section-header" style={{ marginBottom: 32 }}>
        <div className="section-kicker">Empirical Performance Evaluation</div>
        <h2 className="section-display-title">
          <span className="text-display-muted">Controlled Workload Benchmarks. </span>
          <span className="text-display-emphasis">+27.3% Throughput Gain.</span>
        </h2>
        <p className="section-description">
          Performance recorded across identical 3-AMR overlapping pick-and-place routes. Compared against
          traditional centralized stop-and-wait dispatchers under high aisle contention.
        </p>
      </div>

      {/* Benchmark Comparison Table */}
      <div className="data-table-container card-hairline" style={{ marginBottom: 36, overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Performance Metric</th>
              <th>Legacy Centralized Dispatcher</th>
              <th>EdgeFleet Decentralized Mesh</th>
              <th>Measurable Gain</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Total Workload Makespan</strong></td>
              <td><span className="mono-metric" style={{ color: "var(--status-danger)" }}>10 min 30 s</span></td>
              <td><span className="mono-metric" style={{ color: "var(--solar-terracotta)", fontWeight: 700 }}>7 min 38 s</span></td>
              <td><span className="badge badge-active">+27.3% Throughput</span></td>
            </tr>
            <tr>
              <td><strong>Conflict Decision Latency</strong></td>
              <td><span className="mono-metric" style={{ color: "var(--status-danger)" }}>450 - 1,200 ms (Cloud roundtrip)</span></td>
              <td><span className="mono-metric" style={{ color: "var(--solar-terracotta)", fontWeight: 700 }}>p95 &lt; 150 ms (~84 ms observed on LAN)</span></td>
              <td><span className="badge badge-active">Target Met</span></td>
            </tr>
            <tr>
              <td><strong>Single Point of Failure (SPOF)</strong></td>
              <td><span style={{ color: "var(--status-danger)" }}>Central controller offline = All AMRs freeze</span></td>
              <td><span style={{ color: "var(--solar-terracotta)", fontWeight: 700 }}>Zero SPOF (Autonomous peer quorum)</span></td>
              <td><span className="badge badge-active">100% Resilience</span></td>
            </tr>
            <tr>
              <td><strong>Aisle Blockage Recovery Time</strong></td>
              <td><span className="mono-metric" style={{ color: "var(--status-warning)" }}>Manual operator reroute (~180 s)</span></td>
              <td><span className="mono-metric" style={{ color: "var(--solar-terracotta)", fontWeight: 700 }}>Autonomous detouring (&lt; 1.2 s)</span></td>
              <td><span className="badge badge-active">Instantaneous Recovery</span></td>
            </tr>
            <tr>
              <td><strong>Collision Count</strong></td>
              <td><span className="mono-metric">0 (with excessive conservative stops)</span></td>
              <td><span className="mono-metric" style={{ color: "var(--solar-terracotta)", fontWeight: 700 }}>0 (with dynamic space-time efficiency)</span></td>
              <td><span className="badge badge-active">Zero Safety Compromise</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Hardware & Edge Specifications */}
      <div id="specs" style={{ marginTop: 28 }}>
        <div className="section-header" style={{ marginBottom: 24 }}>
          <div className="section-kicker">Hardware &amp; Edge Architecture</div>
          <h3 className="section-display-title" style={{ fontSize: "1.5rem" }}>
            <span className="text-display-muted">Onboard AMR Compute. </span>
            <span className="text-display-emphasis">SWaP-C Specification.</span>
          </h3>
          <p className="section-description">
            Engineered for Size, Weight, Power, and Cost (SWaP-C) constraints of industrial driverless trucks.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 28 }}>
          <div
            className="card-hairline"
            style={{
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Cpu className="w-4 h-4 text-blue-600" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.04em" }}>
                Compute Engine
              </span>
            </div>
            <strong style={{ fontSize: 14, color: "var(--text-primary)" }}>Raspberry Pi 5 / Jetson Orin</strong>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>
              Quad-core ARM Cortex-A76 @ 2.4GHz with 8GB LPDDR4X. Consumes &lt;12W power onboard.
            </p>
          </div>

          <div
            className="card-hairline"
            style={{
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Wifi className="w-4 h-4" style={{ color: "var(--solar-terracotta)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.04em" }}>
                Middleware Transport
              </span>
            </div>
            <strong style={{ fontSize: 14, color: "var(--text-primary)" }}>ROS 2 Humble / Zenoh DDS</strong>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>
              Micro-XRCE-DDS and Eclipse Zenoh for high-frequency peer trajectory intent over 5GHz Wi-Fi LAN.
            </p>
          </div>

          <div
            className="card-hairline"
            style={{
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Zap className="w-4 h-4 text-amber-600" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.04em" }}>
                Sensor Fusion
              </span>
            </div>
            <strong style={{ fontSize: 14, color: "var(--text-primary)" }}>Safety LiDAR &amp; RealSense</strong>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>
              2D/3D Time-of-Flight LiDAR, Intel RealSense D435i, optical encoders, and 9-DOF IMU EKF fusion.
            </p>
          </div>

          <div
            className="card-hairline"
            style={{
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <HardDrive className="w-4 h-4 text-purple-600" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.04em" }}>
                Audit Storage &amp; RAG
              </span>
            </div>
            <strong style={{ fontSize: 14, color: "var(--text-primary)" }}>PostgreSQL + pgvector</strong>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>
              Asynchronous write-behind transaction logging and 384-d cosine similarity incident search.
            </p>
          </div>
        </div>

        {/* Purpose-Built Image: Onboard Edge Compute Module */}
        <div
          className="card-hairline"
          style={{
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "var(--shadow-subtle)",
            backgroundColor: "var(--bg-elevated)",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "auto", aspectRatio: "16/9", maxHeight: 420 }}>
            <img
              src="/images/edge-intelligence.jpg"
              alt="Close-up engineering view of an autonomous mobile robot chassis with ruggedized onboard industrial edge computing unit and telemetry ports"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
          <div
            style={{
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
              borderTop: "1px solid var(--border-subtle)",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>Ruggedized Onboard AMR Microcomputer (AMR-ECU-03) &middot; SWaP-C Validated</span>
            </span>
            <span className="font-mono">Total Edge Power Consumption: &lt;12 Watts</span>
          </div>
        </div>
      </div>
    </section>
  );
}
