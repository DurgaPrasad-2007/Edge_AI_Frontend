import { Award, CheckCircle, FileText, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function ReviewerSnapshot() {
  const points = [
    { label: "SIH Challenge ID", val: "Problem Statement 26123", status: "Official" },
    { label: "Target Industrial Domain", val: "High-Bay Smart Warehouses & Factory Logistics", status: "Verified" },
    { label: "Coordination Protocol", val: "Decentralized P2P Space-Time Mutex & Contract-Net", status: "Zero SPOF" },
    { label: "Decision Latency", val: "<84ms P95 over local ROS 2 / Zenoh DDS mesh", status: "10x Gain" },
    { label: "Chokepoint Arbitration", val: "Corridor C-14 deterministic utility leases", status: "0 Deadlocks" },
    { label: "Dynamic Obstacle Detour", val: "Aisle B-07 invalidation & autonomous reroute in <42ms", status: "Real-time" },
    { label: "Safety Standard", val: "ISO 3691-4:2023 (0.5m dynamic safety envelope)", status: "Compliant" },
    { label: "Web API Boundary", val: "SIL-2 Zero-Motion Observer Guarantee (No wheel commands)", status: "Enforced" },
    { label: "Knowledge Store", val: "PostgreSQL 16 + pgvector (384-d HNSW index)", status: "<15ms RAG" },
    { label: "Edge Hardware Footprint", val: "Raspberry Pi 5 / Jetson Orin (<120MB RAM, <12W)", status: "SWaP-C" },
  ];

  return (
    <section className="content-section" style={{ borderBottom: "none" }}>
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-tactical)",
          borderRadius: 8,
          padding: "28px",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Award className="w-5 h-5 text-blue-600" />
              <span className="font-mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--status-active)", letterSpacing: "0.06em" }}>
                SIH 2026 &amp; BEL EVALUATION CRITERIA
              </span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>
              Technical Snapshot for Reviewers
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
              Verifiable project scorecard mapped against SIH-26123 problem expectations and Bharat Electronics Limited (BEL) R&amp;D standards.
            </p>
          </div>

          <Link href="/docs" className="btn btn-secondary" style={{ fontSize: 12 }}>
            <FileText className="w-3.5 h-3.5" />
            Full Technical Spec &rarr;
          </Link>
        </div>

        {/* 2-Column Snapshot Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
          {points.map((p, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 6,
                fontSize: 12.5,
              }}
            >
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: 11, display: "block", textTransform: "uppercase", fontWeight: 600 }}>
                  {p.label}
                </span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.val}</span>
              </div>
              <span className="badge badge-nominal" style={{ fontSize: 10, whiteSpace: "nowrap" }}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
