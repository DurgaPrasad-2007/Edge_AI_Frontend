import { Calculator, GitMerge, Cpu, ArrowRight } from "lucide-react";

export function ArchitectureSection() {
  return (
    <section id="architecture" className="content-section">
      <div className="section-header">
        <div className="section-kicker">Theoretical Rigor &amp; Engineering Design</div>
        <h2 className="section-title">Decentralized Protocol &amp; Task Bidding Formulation</h2>
        <p className="section-description">
          EdgeFleet replaces brittle central heuristics with mathematical optimization. Robots calculate utility bids
          and arbitrate corridor contention on edge hardware using deterministic state machines.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>
        {/* Card 1: Task Auction Utility Formula */}
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-tactical)",
            borderRadius: 8,
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
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-tactical)",
              borderRadius: 6,
              padding: "16px",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            <div className="font-mono" style={{ fontSize: 15, fontWeight: 700, color: "var(--status-active)" }}>
              U(r, t) = w_p &middot; P(t) - w_d &middot; D(r, t) + w_b &middot; (B_r - B_min)
            </div>
          </div>

          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
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
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-tactical)",
            borderRadius: 8,
            padding: "24px",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <GitMerge className="w-5 h-5 text-emerald-600" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              Corridor C-14 Space-Time Mutex
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 14 }}>
            Single-lane corridors prohibit dual-direction transit. The peer arbiter protocol enforces deterministic
            conflict resolution:
          </p>

          {/* ASCII / Monospace State Machine Diagram */}
          <pre
            className="font-mono"
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-tactical)",
              borderRadius: 6,
              padding: "12px",
              fontSize: 11,
              lineHeight: 1.4,
              color: "var(--text-primary)",
              overflowX: "auto",
              marginBottom: 14,
            }}
          >
{`[ 1. INTENT BROADCAST ]
Robot broadcasts: {id: "AMR-01", corridor: "C-14", eta: 4.8s}
        |
        v
[ 2. LOCAL DETERMINISTIC SCORING ]
Score = Priority*1.0 + (100 - Battery)*0.2
Winner claims exclusive lease (duration: 4.8s)
        |
   +----+----+
   |         |
[Winner]   [Loser]
   |         |
   v         v
[PASSAGE]  [YIELD & HOLD]
Traverse   Wait at WP-04 holding bay`}
          </pre>

          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
            Guarantees zero deadlocks through monotonic tie-breaking and lease expiration timeouts.
          </p>
        </div>
      </div>
    </section>
  );
}
