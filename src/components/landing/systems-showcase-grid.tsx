"use client";

import { ArrowUpRight, ShieldCheck, Cpu, Radio, GitMerge, Calculator, Clock, HardDrive, Eye } from "lucide-react";
import { playClick } from "@/lib/sound-effects";

interface SubsystemItem {
  index: string;
  title: string;
  category: string;
  metric: string;
  description: string;
  href: string;
  icon: typeof Clock;
}

const SUBSYSTEMS: SubsystemItem[] = [
  {
    index: "01",
    title: "Space-Time Mutex",
    category: "Corridor C-14 Arbiter",
    metric: "0 Deadlocks",
    description: "Monotonic 4-tier utility scoring (Safety > Urgency > Battery > Arrival) for exclusive corridor transit leases.",
    href: "#simulator",
    icon: Clock,
  },
  {
    index: "02",
    title: "Zenoh V2V Peer Wire",
    category: "Transport Bus",
    metric: "48-byte CDR",
    description: "Decentralized unicast/multicast gossip mesh via rmw_zenoh eliminating central Wi-Fi discovery storms.",
    href: "#protocol-flow",
    icon: Radio,
  },
  {
    index: "03",
    title: "D* Lite Dynamic Detour",
    category: "Graph Repair",
    metric: "~42ms Latency",
    description: "Incremental Aisle B-07 obstacle repair without costly global re-planning; reroutes safely along perimeter racks.",
    href: "#simulator",
    icon: GitMerge,
  },
  {
    index: "04",
    title: "Contract-Net MRTA",
    category: "Task Bidding",
    metric: "Sub-150ms P95",
    description: "Distributed multi-robot task allocation auctioning stranded pallet picks to nearest eligible idle peers.",
    href: "#architecture",
    icon: Calculator,
  },
  {
    index: "05",
    title: "ISO 3691-4 Envelope",
    category: "Safety Separation",
    metric: "0.5m Clearance",
    description: "Concentric optical LiDAR zones switching from nominal cruising to 0.4m/s creep speed and fail-safe hold.",
    href: "#compliance",
    icon: ShieldCheck,
  },
  {
    index: "06",
    title: "pgvector SOP Store",
    category: "Semantic Audit Store",
    metric: "384-d HNSW",
    description: "Asynchronous PostgreSQL vector storage for warehouse SOP retrieval and incident audit log queries.",
    href: "#simulator",
    icon: HardDrive,
  },
  {
    index: "07",
    title: "SWaP-C Edge Microcomputer",
    category: "Hardware ECU",
    metric: "<12W Power",
    description: "Deployable on Raspberry Pi 5 & Jetson Orin under strict 120MB RAM and thermal warehouse limits.",
    href: "#specs",
    icon: Cpu,
  },
  {
    index: "08",
    title: "Zero-Motion Console",
    category: "Actuator Isolation",
    metric: "Strict Observer",
    description: "Guaranteed non-motion boundary: APIs and consoles monitor telemetry without direct motor actuation authority.",
    href: "#compliance",
    icon: Eye,
  },
];

export function SystemsShowcaseGrid() {
  return (
    <section id="systems-grid" className="content-section" style={{ paddingTop: 40, paddingBottom: 40 }}>
      {/* 21st.dev + Dali Agency Section Header */}
      <div className="section-header" style={{ marginBottom: 32 }}>
        <div className="section-kicker">01 // Architectural Systems Sub-Modules</div>
        <h2 className="section-display-title">
          <span className="text-display-muted">8 Deterministic Primitives. </span>
          <span className="text-display-emphasis">Zero Monolithic Fragility.</span>
        </h2>
        <p className="section-description">
          Each component operates as an autonomous, self-contained edge module directly on the AMR microcomputer,
          providing bounded latency, mathematical safety clearance, and zero single-point-of-failure risk.
        </p>
      </div>

      {/* Dali Agency Shared Hairline Border Grid */}
      <div className="shared-border-grid card-hairline">
        {SUBSYSTEMS.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.index}
              href={item.href}
              onClick={() => playClick()}
              className="shared-border-cell group"
            >
              {/* Header: Index + Corner Action Arrow */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {item.index}
                </span>
                <span className="cell-arrow" style={{ color: "var(--text-muted)" }}>
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>

              {/* Subsystem Icon & Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Icon className="w-3.5 h-3.5 text-muted" />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {item.category}
                </span>
              </div>

              {/* Subsystem Title */}
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                  letterSpacing: "-0.015em",
                  lineHeight: 1.25,
                }}
              >
                {item.title}
              </h3>

              {/* Metric Tag */}
              <div style={{ marginBottom: 8 }}>
                <span
                  className="badge badge-nominal"
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    padding: "2px 6px",
                  }}
                >
                  {item.metric}
                </span>
              </div>

              {/* Brief Technical Description */}
              <p
                style={{
                  fontSize: 11.5,
                  color: "var(--text-secondary)",
                  lineHeight: 1.45,
                  margin: 0,
                  flexGrow: 1,
                }}
              >
                {item.description}
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
