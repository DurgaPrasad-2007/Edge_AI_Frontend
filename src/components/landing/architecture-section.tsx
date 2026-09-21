import { Calculator, GitMerge, BookOpen, Layers } from "lucide-react";

export function ArchitectureSection() {
  return (
    <section id="architecture" className="content-section" style={{ paddingTop: 40, paddingBottom: 40 }}>
      {/* 21st.dev Section Header with Two-Tone Display Headline */}
      <div className="section-header" style={{ marginBottom: 32 }}>
        <div className="section-kicker">Theoretical Rigor &amp; Engineering Design</div>
        <h2 className="section-display-title">
          <span className="text-display-muted">Theoretical Rigor. </span>
          <span className="text-display-emphasis">Contract-Net &amp; Space-Time Mutex.</span>
        </h2>
        <p className="section-description">
          EdgeFleet replaces brittle central heuristics with mathematical optimization grounded in recent IEEE MAPF and MRTA research.
          Robots calculate utility bids and arbitrate corridor contention on edge microcomputers using deterministic state machines.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24, marginBottom: 28 }}>
        {/* Card 1: Task Auction Utility Formula */}
        <div
          className="card-hairline"
          style={{
            padding: "24px",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Calculator className="w-5 h-5 text-blue-600" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              Contract-Net Task Utility Formulation
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 16 }}>
            When a dispatch request enters the peer network or an obstacle requires task re-bidding, eligible AMRs
            evaluate utility $U(r, t)$ locally:
          </p>

          {/* Mathematical Formula Display */}
          <div
            className="card-hairline"
            style={{
              backgroundColor: "var(--bg-elevated)",
              padding: "16px",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            <div className="font-mono" style={{ fontSize: 15, fontWeight: 700, color: "var(--status-active)" }}>
              U(r, t) = w_p &middot; P(t) - w_d &middot; D(r, t) + w_b &middot; (B_r - B_min)
            </div>
          </div>

          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "var(--text-secondary)", marginBottom: 16, padding: 0, margin: "0 0 16px 0" }}>
            <li>
              <strong className="font-mono">P(t)</strong>: Task priority level (1 to 100)
            </li>
            <li>
              <strong className="font-mono">D(r, t)</strong>: Orthogonal topological distance to pickup waypoint
            </li>
            <li>
              <strong className="font-mono">B_r</strong>: Current battery state of charge percentage
            </li>
            <li>
              <strong className="font-mono">B_min</strong>: Reserve threshold to reach charging bay safely
            </li>
            <li>
              <strong className="font-mono">w_p, w_d, w_b</strong>: Calibrated normalization coefficients
            </li>
          </ul>

          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
            Highest utility bidder autonomously claims the task and publishes assignment intent to the peer mesh.
          </p>
        </div>

        {/* Card 2: Chokepoint Mutex State Machine */}
        <div
          className="card-hairline"
          style={{
            padding: "24px",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <GitMerge className="w-5 h-5" style={{ color: "var(--solar-terracotta)" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              Corridor C-14 Space-Time Mutex
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 14 }}>
            Single-lane corridors prohibit dual-direction transit. The peer arbiter protocol enforces deterministic
            conflict resolution based on a 4-tier tie-breaking hierarchy:
          </p>

          {/* ASCII / Monospace State Machine Diagram */}
          <pre
            className="font-mono card-hairline"
            style={{
              backgroundColor: "var(--bg-elevated)",
              padding: "12px",
              fontSize: 11,
              lineHeight: 1.45,
              color: "var(--text-primary)",
              overflowX: "auto",
              marginBottom: 14,
            }}
          >
{`[ 1. INTENT BROADCAST ]
Robot publishes: {id, corridor: "C-14", eta, priority, battery}
        |
        v
[ 2. DETERMINISTIC SCORING HIERARCHY ]
Score: Safety Buffer (0.5m) -> Task Urgency -> Battery Margin -> Arrival Time
Winner claims renewable short-lived lease
        |
   +----+----+
   |         |
[Winner]   [Loser]
   |         |
   v         v
[PASSAGE]  [YIELD & HOLD]
Traverse   Wait at WP-14 holding bay
corridor   Release on exit or lease expiry`}
          </pre>

          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
            Guarantees zero deadlocks through monotonic tie-breaking and automatic lease expiration timeouts.
          </p>
        </div>
      </div>

      {/* Academic Literature & Reference Architecture Strip */}
      <div
        className="card-hairline"
        style={{
          padding: "20px 24px",
          boxShadow: "var(--shadow-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <BookOpen className="w-4 h-4 text-blue-600" />
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Academic &amp; Open-Source Lineage (SIH_PPT_REFERENCES.md)
          </h4>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, fontSize: 12.5, color: "var(--text-secondary)" }}>
          <div>
            <strong style={{ color: "var(--text-primary)" }}>Open-RMF Fleet Adapter Pattern:</strong>
            <p style={{ margin: "4px 0 0", lineHeight: 1.45, color: "var(--text-muted)" }}>
              Separation of robot integration adapters, traffic data, and operator console UI, moving passage decisions to robot peers.
            </p>
          </div>
          <div>
            <strong style={{ color: "var(--text-primary)" }}>ORCA Velocity Obstacles (van den Berg):</strong>
            <p style={{ margin: "4px 0 0", lineHeight: 1.45, color: "var(--text-muted)" }}>
              Reciprocal local velocity constraints as the reactive obstacle envelope (0.5m lateral clearance) below corridor leases.
            </p>
          </div>
          <div>
            <strong style={{ color: "var(--text-primary)" }}>MAPF Benchmarks (Stern et al. / IEEE CASE):</strong>
            <p style={{ margin: "4px 0 0", lineHeight: 1.45, color: "var(--text-muted)" }}>
              Rigorous vertex/edge conflict definitions and makespan evaluation comparing centralized vs. peer policies.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
