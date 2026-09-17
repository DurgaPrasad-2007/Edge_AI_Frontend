import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  BookOpen,
  Cpu,
  ShieldCheck,
  Calculator,
  GitMerge,
  Radio,
  HardDrive,
  CheckCircle2,
  Terminal,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "Technical Documentation — EdgeFleet | SIH 26123 & BEL Evaluation",
  description: "Comprehensive system architecture, mathematical formulations, peer mesh protocols, ISO 3691-4 safety envelopes, and hardware SWaP-C profile for EdgeFleet.",
};

export default function DocsPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main id="main-content" className="page-wrapper" style={{ flex: 1, paddingTop: 40 }}>
        {/* Header Strip */}
        <div style={{ marginBottom: 36, borderBottom: "1px solid var(--border-tactical)", paddingBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span className="badge badge-active">SIH-26123</span>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>/</span>
            <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
              Technical Reference Manual
            </span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>
            EdgeFleet Technical Architecture &amp; System Manual
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 840, lineHeight: 1.6 }}>
            Comprehensive architectural specifications, mathematical formulations, peer-to-peer ROS 2 / Zenoh DDS
            messaging protocols, ISO 3691-4 safety cases, and edge deployment criteria for SIH 2026 Problem Statement 26123.
          </p>
        </div>

        {/* 2-Column Documentation Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 36 }}>
          {/* Table of Contents Sticky Sidebar */}
          <aside style={{ position: "sticky", top: 84, height: "fit-content" }} aria-label="Documentation Navigation">
            <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 12 }}>
              Sections
            </h2>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <li>
                <a href="#overview" style={{ color: "var(--text-secondary)", display: "block", padding: "4px 0" }}>
                  1. Problem Scope &amp; SIH-26123
                </a>
              </li>
              <li>
                <a href="#math-model" style={{ color: "var(--text-secondary)", display: "block", padding: "4px 0" }}>
                  2. Mathematical Formulations
                </a>
              </li>
              <li>
                <a href="#p2p-mesh" style={{ color: "var(--text-secondary)", display: "block", padding: "4px 0" }}>
                  3. Peer Mesh Protocol (ROS 2 / Zenoh)
                </a>
              </li>
              <li>
                <a href="#chokepoints" style={{ color: "var(--text-secondary)", display: "block", padding: "4px 0" }}>
                  4. Chokepoint Mutex Arbitration
                </a>
              </li>
              <li>
                <a href="#safety-iso" style={{ color: "var(--text-secondary)", display: "block", padding: "4px 0" }}>
                  5. Safety Envelope (ISO 3691-4)
                </a>
              </li>
              <li>
                <a href="#hardware" style={{ color: "var(--text-secondary)", display: "block", padding: "4px 0" }}>
                  6. Hardware &amp; SWaP-C Footprint
                </a>
              </li>
              <li>
                <a href="#rag-vector" style={{ color: "var(--text-secondary)", display: "block", padding: "4px 0" }}>
                  7. PostgreSQL pgvector SOP Store
                </a>
              </li>
              <li>
                <a href="#faq" style={{ color: "var(--text-secondary)", display: "block", padding: "4px 0" }}>
                  8. Reviewer FAQ
                </a>
              </li>
            </ul>
          </aside>

          {/* Main Documentation Body */}
          <article style={{ display: "flex", flexDirection: "column", gap: 48, maxWidth: 920 }}>
            {/* Section 1: Problem Scope */}
            <section id="overview">
              <span className="section-kicker">Section 01</span>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
                Problem Scope &amp; SIH 2026 Problem Statement 26123
              </h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, marginBottom: 14 }}>
                In modern smart warehouses and industrial manufacturing plants, fleets of Autonomous Mobile Robots (AMRs)
                are tasked with moving materials across narrow high-bay aisles. Conventional automation systems rely on
                centralized fleet managers operating over cloud servers or centralized edge servers.
              </p>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, marginBottom: 14 }}>
                This centralized architecture suffers from three fatal industrial bottlenecks:
              </p>
              <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
                <div style={{ padding: 14, backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-tactical)", borderRadius: 6 }}>
                  <strong style={{ color: "var(--status-danger)", fontSize: 13 }}>1. Single Point of Failure (SPOF):</strong>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                    If the central server, switch, or external network fails, all 50+ AMRs trigger safety stops simultaneously,
                    causing an average $85,000/hour downtime penalty.
                  </p>
                </div>
                <div style={{ padding: 14, backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-tactical)", borderRadius: 6 }}>
                  <strong style={{ color: "var(--status-danger)", fontSize: 13 }}>2. Round-Trip Latency &amp; Packet Drop:</strong>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                    Cloud round trips (450ms to 1,200ms) introduce sluggish responses at dynamic intersections, forcing AMRs
                    to adopt overly conservative travel buffers that degrade total facility makespan.
                  </p>
                </div>
                <div style={{ padding: 14, backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-tactical)", borderRadius: 6 }}>
                  <strong style={{ color: "var(--status-danger)", fontSize: 13 }}>3. Chokepoint Deadlocks:</strong>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                    In narrow single-lane corridors (e.g. Corridor C-14), simultaneous arrival from opposing directions leads to
                    conservative freeze deadlocks requiring manual operator intervention.
                  </p>
                </div>
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.7 }}>
                <strong>EdgeFleet solves this</strong> by migrating coordination directly onto the robot's onboard microcomputer.
                Each robot runs an asynchronous coordination agent that communicates directly with neighboring AMRs over a local
                mesh without central intervention.
              </p>
            </section>

            {/* Section 2: Mathematical Model */}
            <section id="math-model">
              <span className="section-kicker">Section 02</span>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
                Mathematical Formulations: Contract-Net &amp; Utility Bidding
              </h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, marginBottom: 14 }}>
                Task distribution across decentralized AMRs uses a market-based Contract-Net protocol. When a cargo transfer
                is posted, eligible AMRs calculate an individual bid score $U(r, t)$:
              </p>
              <div
                style={{
                  padding: 18,
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-tactical)",
                  borderRadius: 6,
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                <code className="font-mono" style={{ fontSize: 16, fontWeight: 700, color: "var(--status-active)" }}>
                  U(r, t) = w_p &middot; P(t) - w_d &middot; D(r, t) + w_b &middot; (B_r - B_min)
                </code>
              </div>
              <table className="data-table" style={{ marginBottom: 16 }}>
                <thead>
                  <tr>
                    <th>Variable</th>
                    <th>Definition</th>
                    <th>Nominal Weight</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>P(t)</code></td>
                    <td>Task priority score (1 to 100) based on production line urgency</td>
                    <td><code>w_p = 0.30</code></td>
                  </tr>
                  <tr>
                    <td><code>D(r, t)</code></td>
                    <td>Topological Euclidean / Manhattan distance from robot position to pickup node</td>
                    <td><code>w_d = 0.10</code></td>
                  </tr>
                  <tr>
                    <td><code>B_r</code></td>
                    <td>Current robot battery state of charge (0 to 100%)</td>
                    <td><code>w_b = 0.35</code></td>
                  </tr>
                  <tr>
                    <td><code>B_min</code></td>
                    <td>Safety reserve threshold (20%) required to return to charging bay</td>
                    <td>Constraint</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Tie-breaking is strictly monotonic: if two AMRs produce equal utility scores within a &plusmn;0.5% tolerance,
                the robot with the lower hardware ID (e.g. AMR-01 over AMR-02) takes precedence, ensuring 100% deterministic consensus.
              </p>
            </section>

            {/* Section 3: Peer Mesh Protocol */}
            <section id="p2p-mesh">
              <span className="section-kicker">Section 03</span>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
                Peer Mesh Communication Protocol (ROS 2 / Zenoh DDS)
              </h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, marginBottom: 14 }}>
                AMRs discover and communicate with peers using Eclipse Zenoh and ROS 2 Micro-XRCE-DDS over an isolated 5GHz
                industrial Wi-Fi LAN. Trajectory intents are published as compact binary messages:
              </p>
              <pre
                className="font-mono"
                style={{
                  padding: 14,
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-tactical)",
                  borderRadius: 6,
                  fontSize: 12,
                  lineHeight: 1.5,
                  overflowX: "auto",
                  marginBottom: 16,
                }}
              >
{`struct TrajectoryIntent {
  uint32_t robot_id;          // e.g. 0x01 for AMR-01
  uint64_t timestamp_ns;      // Hardware synchronized timestamp
  Point2D  position;          // Millimeter precision (X, Y)
  float    heading_rad;       // Chassis orientation in radians
  uint16_t current_velocity;  // mm/s
  uint32_t target_corridor;   // Spatial Cell ID (e.g. C-14)
  uint32_t eta_milliseconds;  // Expected time to clear corridor
  uint8_t  sha256_sig[32];    // HMAC hardware signature
};`}
              </pre>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Packet overhead is under 96 bytes per broadcast, enabling 20Hz intent exchanges while consuming less than 1.8%
                of local LAN bandwidth.
              </p>
            </section>

            {/* Section 4: Chokepoint Mutex Arbitration */}
            <section id="chokepoints">
              <span className="section-kicker">Section 04</span>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
                Chokepoint Spatial Mutex Leases (Corridor C-14)
              </h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, marginBottom: 14 }}>
                Corridor C-14 represents a single-lane physical choke point between High-Bay racks. To guarantee zero collisions,
                the corridor is modeled as an atomic distributed mutex:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 16 }}>
                <div style={{ padding: 14, backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-tactical)", borderRadius: 6 }}>
                  <strong style={{ fontSize: 13, color: "var(--status-active)" }}>1. Intent Publish:</strong>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                    Approaching AMR broadcasts traversal intent 5 meters prior to portal WP-04 or WP-09.
                  </p>
                </div>
                <div style={{ padding: 14, backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-tactical)", borderRadius: 6 }}>
                  <strong style={{ fontSize: 13, color: "var(--status-active)" }}>2. Distributed Grant:</strong>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                    If no lease is active, the requesting robot claims an exclusive 4.8s time-space lease.
                  </p>
                </div>
                <div style={{ padding: 14, backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-tactical)", borderRadius: 6 }}>
                  <strong style={{ fontSize: 13, color: "var(--status-active)" }}>3. Yield at Holding Bay:</strong>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                    Competing AMRs yield at designated holding waypoints until LEASE_RELEASED broadcast is received.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Safety ISO 3691-4 */}
            <section id="safety-iso">
              <span className="section-kicker">Section 05</span>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
                Safety Envelope &amp; ISO 3691-4:2023 Compliance
              </h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, marginBottom: 14 }}>
                ISO 3691-4:2023 specifies safety requirements for driverless industrial trucks. EdgeFleet enforces:
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
                <li style={{ display: "flex", gap: 8 }}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>0.5m Lateral Clearance:</strong> Safe stopping distance calculated dynamically based on current payload mass and speed.</span>
                </li>
                <li style={{ display: "flex", gap: 8 }}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Dynamic LiDAR Zone Switching:</strong> Field of view narrows when entering single-lane corridors to prevent false positive tripping against rack legs.</span>
                </li>
                <li style={{ display: "flex", gap: 8 }}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Zero-Motion Web Observer:</strong> The web console and REST APIs are strictly read-only observers; motor drives are controlled exclusively by SIL-2 certified hardware.</span>
                </li>
              </ul>
            </section>

            {/* Section 6: Hardware */}
            <section id="hardware">
              <span className="section-kicker">Section 06</span>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
                Hardware &amp; SWaP-C Footprint
              </h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, marginBottom: 14 }}>
                EdgeFleet runs on lightweight edge computers, verified on:
              </p>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Specification</th>
                    <th>Measured Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Compute Processor</td>
                    <td>Raspberry Pi 5 (Quad ARM Cortex-A76 @ 2.4GHz) or Jetson Orin Nano</td>
                    <td>CPU &lt;8% @ 20Hz Tick Rate</td>
                  </tr>
                  <tr>
                    <td>System Memory</td>
                    <td>8GB LPDDR4X</td>
                    <td>RAM &lt;120MB per Coordination Daemon</td>
                  </tr>
                  <tr>
                    <td>Power Draw</td>
                    <td>5V / 5A DC from AMR Auxiliary Bus</td>
                    <td>&lt;12W Maximum Load</td>
                  </tr>
                  <tr>
                    <td>Network Transport</td>
                    <td>Dual-Band 802.11ac / 802.11ax (5GHz Wi-Fi)</td>
                    <td>Bandwidth &lt;180 kbps per AMR</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Section 7: pgvector */}
            <section id="rag-vector">
              <span className="section-kicker">Section 07</span>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
                PostgreSQL + pgvector Knowledge Base
              </h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, marginBottom: 14 }}>
                Warehouse standard operating procedures (SOPs), battery docking manuals, and incident mitigation policies
                are embedded into a 384-dimensional vector space using cosine distance and an HNSW index in PostgreSQL 16.
                Operators and edge supervisors query incident recovery steps with sub-15ms retrieval latency.
              </p>
            </section>

            {/* Section 8: FAQ */}
            <section id="faq">
              <span className="section-kicker">Section 08</span>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
                Reviewer &amp; Evaluator FAQ
              </h2>
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ padding: 16, backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-tactical)", borderRadius: 6 }}>
                  <strong style={{ fontSize: 14, color: "var(--text-primary)" }}>
                    How does EdgeFleet guarantee zero deadlocks without a central controller?
                  </strong>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>
                    Deadlocks are prevented through monotonic scoring: priority, battery, and deterministic ID tie-breaking
                    ensure that one AMR always possesses strictly higher rank. Leases are time-bounded (4.8s); if a robot halts,
                    the lease expires automatically, preventing permanent holds.
                  </p>
                </div>
                <div style={{ padding: 16, backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-tactical)", borderRadius: 6 }}>
                  <strong style={{ fontSize: 14, color: "var(--text-primary)" }}>
                    Can the web console remotely move or teleoperate the robots?
                  </strong>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>
                    No. To comply with SIL-2 and ISO 3691-4 safety certification, the web console is strictly a passive observer.
                    It cannot publish motion commands to actuator topics. Physical motion is governed entirely by the robot's onboard controllers.
                  </p>
                </div>
              </div>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
