import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ShieldAlert, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Security & Safety Assurance — EdgeFleet",
  description: "IEC 62443 industrial cybersecurity standards, zero-motion API boundary guarantee, and hardware E-Stop isolation.",
};

export default function SecurityPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main id="main-content" className="page-wrapper" style={{ flex: 1, paddingTop: 40 }}>
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <div style={{ marginBottom: 32, borderBottom: "1px solid var(--border-tactical)", paddingBottom: 20 }}>
            <span className="badge badge-nominal" style={{ marginBottom: 10 }}>
              IEC 62443-4-2 &middot; SIL-2 ASSURANCE
            </span>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              Security Advisory &amp; Safety Boundary Architecture
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
              Industrial Safety Integrity Level (SIL) and Operational Cyber-Defense
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 28, fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)" }}>
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
                1. The Zero-Motion API Boundary Guarantee
              </h2>
              <p>
                In industrial robotics and defence applications, web interfaces must never possess direct control over
                physical wheel actuators. EdgeFleet strictly guarantees that:
              </p>
              <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                <li>Web and REST APIs operate as <strong>strictly read-only observers</strong> of decentralized fleet state.</li>
                <li>No network packet from the cloud or browser can command wheel velocity, steering angle, or brake overrides.</li>
                <li>Physical motor drives are governed exclusively by SIL-2 certified onboard microcontrollers wired to independent hardware E-stop loops.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
                2. Operational Network Isolation (IEC 62443)
              </h2>
              <p>
                AMR peer coordination packets communicate across an air-gapped or cryptographically isolated industrial
                VLAN. Node-to-node peer discovery utilizes signed Zenoh tokens with mutual authentication, preventing rogue
                packet injection or man-in-the-middle path spoofing.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
                3. Fail-Safe Behavior on Communication Loss
              </h2>
              <p>
                Should an AMR lose Wi-Fi connectivity or peer heartbeats for more than 400ms:
              </p>
              <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                <li>The robot automatically transitions from active transit to an autonomous controlled stop within its current lane.</li>
                <li>Any held corridor space-time leases (e.g. C-14) automatically expire via monotonic timeout.</li>
                <li>The robot activates optical safety beacons and yields right-of-way until peer heartbeat is restored.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
