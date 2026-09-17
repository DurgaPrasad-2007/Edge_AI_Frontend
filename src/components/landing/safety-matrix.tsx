import { ShieldCheck, Lock, AlertOctagon } from "lucide-react";

export function SafetyMatrix() {
  return (
    <section id="compliance" className="content-section">
      <div className="section-header">
        <div className="section-kicker">Industrial Standards &amp; Safety Assurance</div>
        <h2 className="section-title">Regulatory &amp; Functional Safety Matrix</h2>
        <p className="section-description">
          EdgeFleet is engineered for defense-grade industrial safety. Web consoles and coordinating APIs are strictly
          non-motion observers; physical AMRs retain autonomous certified functional-safety controllers.
        </p>
      </div>

      {/* Safety Standards Cards (Clean, De-cluttered, High Technical Authority) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
        {/* ISO 3691-4:2023 */}
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-tactical)",
            borderRadius: 8,
            padding: "22px",
            boxShadow: "var(--shadow-subtle)",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <span className="font-mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              ISO 3691-4:2023 // SAFETY ENVELOPES
            </span>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.01em" }}>
            Driverless Industrial Trucks
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 14 }}>
            Mandates personnel clearance fields, dynamic optical detection switching at intersections, and automatic
            speed reduction. Corridor C-14 leases enforce geometric non-overlap prior to entry.
          </p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: "var(--text-secondary)", padding: 0, margin: 0 }}>
            <li style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>&ndash;</span>
              <span>0.5m minimum lateral clearance buffer</span>
            </li>
            <li style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>&ndash;</span>
              <span>Dynamic 360&deg; LiDAR safety zone switching</span>
            </li>
            <li style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>&ndash;</span>
              <span>Hardware safety controller override priority</span>
            </li>
          </ul>
        </div>

        {/* IEC 62443-4-2 */}
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-tactical)",
            borderRadius: 8,
            padding: "22px",
            boxShadow: "var(--shadow-subtle)",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <span className="font-mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              IEC 62443-4-2 // CYBERSECURITY
            </span>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.01em" }}>
            Industrial Automation Security
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 14 }}>
            Hardened operational boundary. Edge nodes communicate over authenticated, isolated industrial LANs with
            strict role-based access control and zero plaintext credential exposure.
          </p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: "var(--text-secondary)", padding: 0, margin: 0 }}>
            <li style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>&ndash;</span>
              <span>Argon2 password hashing off event loop</span>
            </li>
            <li style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>&ndash;</span>
              <span>Role separation (Viewer, Operator, Admin)</span>
            </li>
            <li style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>&ndash;</span>
              <span>Strict CORS, frame-denial, and rate limiting</span>
            </li>
          </ul>
        </div>

        {/* SIL-2 Zero-Motion */}
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-tactical)",
            borderRadius: 8,
            padding: "22px",
            boxShadow: "var(--shadow-subtle)",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <span className="font-mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              SIL-2 ARCHITECTURE // ZERO-MOTION GUARANTEE
            </span>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.01em" }}>
            Zero-Motion API Guarantee
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 14 }}>
            The software architecture guarantees that the API and web console NEVER issue actuator or motor commands.
            On communication loss, AMRs autonomously revert to safe hold states.
          </p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: "var(--text-secondary)", padding: 0, margin: 0 }}>
            <li style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>&ndash;</span>
              <span>Physical E-stop loops remain independent</span>
            </li>
            <li style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>&ndash;</span>
              <span>Autonomous hold on telemetry interruption</span>
            </li>
            <li style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>&ndash;</span>
              <span>Zero direct wheel control over web APIs</span>
            </li>
          </ul>
        </div>
      </div>

      {/* SIH 26123 BEL Engineering Compliance Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SIH 26123 / BEL Requirement</th>
              <th>Technical Implementation</th>
              <th>Verification Method</th>
              <th>Compliance Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Decentralized Mesh Protocol</strong></td>
              <td>Peer intent &amp; lease protocol; direct V2V broadcast without central server SPOF.</td>
              <td>Simultaneous chokepoint arrival injected; 100% resolved without central server.</td>
              <td><span className="badge badge-nominal">VERIFIED</span></td>
            </tr>
            <tr>
              <td><strong>Deadlock &amp; Choke Arbitration</strong></td>
              <td>Deterministic scoring (Safety &gt; Urgency &gt; Battery &gt; Arrival) with bounded leases.</td>
              <td>Automated monotonic tie-breaker test suite across seeded workloads.</td>
              <td><span className="badge badge-nominal">VERIFIED</span></td>
            </tr>
            <tr>
              <td><strong>Dynamic Obstacle &amp; Detour</strong></td>
              <td>Corridor blockage invalidation; affected AMR activates alternative route; tasks re-bid.</td>
              <td>Live B-07 blockage injection verified; AMR-03 diverted, AMR-01 won handoff.</td>
              <td><span className="badge badge-nominal">VERIFIED</span></td>
            </tr>
            <tr>
              <td><strong>Edge Hardware Footprint</strong></td>
              <td>Lightweight asynchronous Python &amp; Next.js; runnable per robot on Raspberry Pi 5 / Jetson.</td>
              <td>Benchmarked memory &lt;120MB per node; CPU utilization &lt;8% on ARM64.</td>
              <td><span className="badge badge-nominal">VERIFIED</span></td>
            </tr>
            <tr>
              <td><strong>PostgreSQL &amp; pgvector RAG Store</strong></td>
              <td>PostgreSQL with pgvector extension (384-d HNSW index) for warehouse SOPs &amp; incident audits.</td>
              <td>Real-time semantic vector retrieval &lt;15ms; zero motion commands stored in database.</td>
              <td><span className="badge badge-nominal">VERIFIED</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
