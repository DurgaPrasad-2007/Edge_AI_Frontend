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
    title: "Peer Message Bus",
    category: "Transport",
    metric: "Broadcast + direct",
    description: "Robots publish pose, claims and intent to each other. In-process pub/sub here; swappable for a network transport (Zenoh/DDS) later.",
    href: "#protocol-flow",
    icon: Radio,
  },
  {
    index: "03",
    title: "A* Dynamic Detour",
    category: "Re-planning",
    metric: "Every robot",
    description: "A blockage is broadcast on the mesh and each robot re-plans with A* around it. Also detours around congestion, not just obstacles.",
    href: "#simulator",
    icon: GitMerge,
  },
  {
    index: "04",
    title: "Contract-Net MRTA",
    category: "Task Bidding",
    metric: "Robot-run auction",
    description: "Tasks are announced to the mesh, every robot bids from its own battery and distance, and the winner is chosen without a dispatcher.",
    href: "#architecture",
    icon: Calculator,
  },
  {
    index: "05",
    title: "Safety Reservations",
    category: "Collision Avoidance",
    metric: "0 collisions",
    description: "All-or-nothing two-node look-ahead claims plus a separation monitor. ISO 3691-4 is a design reference, not a certification.",
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
    title: "Edge Compute Target",
    category: "Hardware",
    metric: "Design target",
    description: "Designed for Raspberry Pi / Jetson-class onboard computers. This repository simulates the fleet on a laptop; hardware is not measured.",
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
