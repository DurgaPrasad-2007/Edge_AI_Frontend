import { XCircle, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export function ProblemSolution() {
  return (
    <section className="content-section">
      <div className="section-header">
        <div className="section-kicker">Problem &amp; Architectural Breakthrough</div>
        <h2 className="section-title">Why Centralized Dispatchers Fail in High-Density Warehouses</h2>
        <p className="section-description">
          Conventional AMR deployments rely on a monolithic central server to plan every path. When Wi-Fi drops,
          corridors congest, or the server halts, entire automated facilities grind to a standstill.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 32 }}>
        {/* The Legacy Centralized Model */}
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-tactical)",
            borderRadius: 8,
            padding: "24px",
            boxShadow: "var(--shadow-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <XCircle className="w-5 h-5 text-red-600" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              Legacy Centralized Dispatchers
            </h3>
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "var(--text-secondary)" }}>
            <li style={{ display: "flex", gap: 10 }}>
              <span style={{ color: "var(--status-danger)", fontWeight: 700 }}>&times;</span>
              <span>
                <strong>Single Point of Failure (SPOF):</strong> Central server outage halts 50+ AMRs simultaneously ($85,000/hr industrial downtime).
              </span>
            </li>
            <li style={{ display: "flex", gap: 10 }}>
              <span style={{ color: "var(--status-danger)", fontWeight: 700 }}>&times;</span>
              <span>
                <strong>Cloud Round-Trip Latency:</strong> Polling cloud dispatchers introduces 450–1,200ms latency spikes across industrial Wi-Fi deadzones.
              </span>
            </li>
            <li style={{ display: "flex", gap: 10 }}>
              <span style={{ color: "var(--status-danger)", fontWeight: 700 }}>&times;</span>
              <span>
                <strong>Chokepoint Deadlocks:</strong> Simultaneous arrival at narrow aisles (e.g. Corridor C-14) causes conservative freeze locks requiring human teleoperation.
              </span>
            </li>
            <li style={{ display: "flex", gap: 10 }}>
              <span style={{ color: "var(--status-danger)", fontWeight: 700 }}>&times;</span>
              <span>
                <strong>Brittle Obstacle Handling:</strong> Blockages require central graph recalculation, stalling all approaching AMRs for 3–12 seconds.
              </span>
            </li>
          </ul>
        </div>

        {/* The EdgeFleet Solution */}
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--status-nominal-border)",
            borderRadius: 8,
            padding: "24px",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              EdgeFleet Distributed Peer Mesh
            </h3>
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "var(--text-secondary)" }}>
            <li style={{ display: "flex", gap: 10 }}>
              <span style={{ color: "var(--status-nominal)", fontWeight: 700 }}>&check;</span>
              <span>
                <strong>Zero Single Point of Failure:</strong> Peer consensus quorum continues operating autonomously even if building WAN connection is completely severed.
              </span>
            </li>
            <li style={{ display: "flex", gap: 10 }}>
              <span style={{ color: "var(--status-nominal)", fontWeight: 700 }}>&check;</span>
              <span>
                <strong>Sub-84ms Decision Latency:</strong> High-speed V2V intent broadcast directly over ROS 2 / Zenoh DDS LAN without cloud round trips.
              </span>
            </li>
            <li style={{ display: "flex", gap: 10 }}>
              <span style={{ color: "var(--status-nominal)", fontWeight: 700 }}>&check;</span>
              <span>
                <strong>Deterministic Space-Time Leases:</strong> Mutex arbitration calculates composite utility (Safety &gt; Priority &gt; Battery) to prevent head-on contention.
              </span>
            </li>
            <li style={{ display: "flex", gap: 10 }}>
              <span style={{ color: "var(--status-nominal)", fontWeight: 700 }}>&check;</span>
              <span>
                <strong>Autonomous Detouring in &lt;42ms:</strong> When Aisle B-07 is blocked, affected AMR re-plans around perimeter highway and triggers peer task auctions.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Purpose-Built Image: Chokepoint & Corridor Spatial Clearance */}
      <div
        style={{
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid var(--border-tactical)",
          boxShadow: "var(--shadow-subtle)",
          backgroundColor: "var(--bg-elevated)",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "auto", aspectRatio: "16/9", maxHeight: 480 }}>
          <img
            src="/images/chokepoint-coordination.jpg"
            alt="Two autonomous mobile robots observing geometric spatial clearance and stop-yield zones at a warehouse corridor intersection"
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
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Corridor Intersection Arbitration &middot; Autonomous Mutual Exclusion Zone</span>
          </span>
          <span className="font-mono">ISO 3691-4:2023 Safety Envelope: 0.5m Lateral Clearance</span>
        </div>
      </div>
    </section>
  );
}
