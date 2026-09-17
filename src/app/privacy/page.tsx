import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ShieldCheck, Lock, Database, Eye } from "lucide-react";

export const metadata = {
  title: "Privacy Policy & Data Protection — EdgeFleet",
  description: "Compliance disclosure under the India Digital Personal Data Protection (DPDP) Act 2023/2026, EU GDPR, and UK GDPR.",
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main id="main-content" className="page-wrapper" style={{ flex: 1, paddingTop: 40 }}>
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <div style={{ marginBottom: 32, borderBottom: "1px solid var(--border-tactical)", paddingBottom: 20 }}>
            <span className="badge badge-nominal" style={{ marginBottom: 10 }}>
              LEGAL &middot; DPDP ACT 2023/2026 &middot; GDPR
            </span>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              Privacy &amp; Operational Telemetry Policy
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
              Last updated: September 2026 &middot; Applicable to EdgeFleet AMR Fleet Coordination System
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 28, fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)" }}>
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
                1. Regulatory Compliance Framework
              </h2>
              <p>
                EdgeFleet complies with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and its
                operative 2026 administrative rules as enacted by the Government of India, alongside the General Data
                Protection Regulation (EU GDPR) and the UK Data Protection Act.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
                2. Scope of Industrial Telemetry
              </h2>
              <p>
                EdgeFleet collects operational telemetry strictly required for safety, fleet navigation, and mutual exclusion
                arbitration across industrial warehouse floors:
              </p>
              <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                <li>Robot identifiers (e.g. AMR-01, AMR-02), hardware MAC addresses, and onboard IP allocations.</li>
                <li>Real-time topological coordinates (X, Y in millimeters), chassis heading, and velocities.</li>
                <li>LiDAR obstacle detection boundaries and protective safety envelope clearance events (ISO 3691-4).</li>
                <li>Corridor space-time lease requests, task auction bids, and completed dispatch records.</li>
              </ul>
              <p style={{ marginTop: 8 }}>
                <strong>No Personal Data of Warehouse Personnel</strong> (such as facial recognition, biometric identity, or voice
                recordings) is collected or processed by the EdgeFleet coordination daemons. Optical LiDAR sensors operate purely as
                spatial range-finders without image capture.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
                3. Local Data Storage &amp; Edge Processing
              </h2>
              <p>
                Peer-to-peer coordination messages (ROS 2 / Zenoh DDS) are broadcast solely across local isolated facility LANs.
                Simulation state caches stored in the browser utilize HTML5 <code>localStorage</code> solely for operator preference
                persistence (theme mode and telemetry consent).
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
                4. Operator Rights &amp; Data Subject Inquiries
              </h2>
              <p>
                Authorized operators and fleet evaluators may inspect transaction logs, export audit streams, or request
                purging of local session caches by contacting the EdgeFleet engineering review board.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
