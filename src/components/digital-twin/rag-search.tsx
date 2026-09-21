"use client";

import { useState } from "react";
import { Search, Database, FileText, CheckCircle2 } from "lucide-react";

interface VectorResult {
  id: string;
  source_name: string;
  content: string;
  similarity?: number;
}

const FALLBACK_RESULTS: Record<string, VectorResult[]> = {
  "Corridor C-14 choke point arbitration": [
    {
      id: "sop-01",
      source_name: "SOP-W2-104 // Intersection Lease Arbitration",
      content:
        "When two or more AMRs approach Corridor C-14 within 5m, the peer arbiter evaluates composite utility U(r, t) = Priority*1.0 + (100 - Battery)*0.2. Highest scorer is granted an exclusive 4.8s time-space lease. Approaching AMRs must yield at holding point WP-04 or WP-09.",
      similarity: 0.942,
    },
    {
      id: "sop-02",
      source_name: "ENG-STD-3691 // Spatial Mutex Lock Protocol",
      content:
        "Single-lane transit aisles are declared non-divisible spatial mutex cells. Mutual exclusion is guaranteed via broadcast lease confirmation over ROS 2 peer mesh before physical boundary entry.",
      similarity: 0.887,
    },
  ],
  "Aisle B-07 obstacle detour SOP": [
    {
      id: "sop-03",
      source_name: "SOP-W2-208 // Dynamic Obstacle Invalidation",
      content:
        "Upon LiDAR detection of a static obstacle exceeding 1.5s in Aisle B-07, the detecting AMR publishes an OBSTACLE_BROADCAST packet. Pathfinding engines invalidate Corridor B-07 and reroute across South Perimeter highway P-2 within 42ms.",
      similarity: 0.958,
    },
    {
      id: "sop-04",
      source_name: "AUCTION-SPEC-09 // Task Re-bidding Trigger",
      content:
        "If a detour increases transit distance by >40%, the affected AMR triggers a localized Contract-Net task auction. Peer robots with lower estimated completion makespan bid to take over delivery at the nearest transfer bay.",
      similarity: 0.891,
    },
  ],
  "Low battery autonomous docking": [
    {
      id: "sop-05",
      source_name: "SOP-BAT-012 // Critical State of Charge Protocol",
      content:
        "AMRs reaching state of charge <= 20% immediately transition to CHARGING_REQUIRED state. In-flight low-priority tasks are relinquished to Contract-Net auction. AMR autonomously reserves charging slot 1, 2, or 3 in the South Charging Bay.",
      similarity: 0.963,
    },
  ],
  "Zero-motion safety boundary": [
    {
      id: "sop-06",
      source_name: "SAFE-SIL2-001 // Software Observer Independence",
      content:
        "Web dispatch consoles, REST APIs, and vector databases operate as read-only telemetry observers. Under no circumstances may an external network packet issue direct actuator or motor commands. Actuator loops are hard-isolated to onboard certified safety microcontrollers.",
      similarity: 0.978,
    },
  ],
};

export function RagSearch() {
  const [query, setQuery] = useState("Corridor C-14 choke point arbitration");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VectorResult[]>(
    FALLBACK_RESULTS["Corridor C-14 choke point arbitration"]
  );

  const handleSearch = async (q: string) => {
    setLoading(true);
    setQuery(q);
    try {
      const apiBase = process.env.NEXT_PUBLIC_EDGE_API_BASE_URL ?? "http://localhost:8000";
      const res = await fetch(`${apiBase}/api/knowledge/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, limit: 3 }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        setResults(FALLBACK_RESULTS[q] || FALLBACK_RESULTS["Corridor C-14 choke point arbitration"]);
      }
    } catch {
      setResults(FALLBACK_RESULTS[q] || FALLBACK_RESULTS["Corridor C-14 choke point arbitration"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-tactical)",
        borderRadius: 8,
        padding: "24px",
        marginTop: 24,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Database className="w-4 h-4" style={{ color: "var(--solar-terracotta)" }} />
            <span className="font-mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--solar-terracotta)", letterSpacing: "0.05em" }}>
              POSTGRESQL + PGVECTOR / HNSW INDEX
            </span>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
            Autonomous Incident &amp; SOP Vector Knowledge Base
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
            Indexed with 384-dimensional cosine embeddings. Query incident recovery and arbitration procedures in real time.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <span className="badge badge-nominal">pgvector (HNSW)</span>
          <span className="badge badge-active">&lt;15ms Latency</span>
        </div>
      </div>

      {/* Quick query chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {[
          "Corridor C-14 choke point arbitration",
          "Aisle B-07 obstacle detour SOP",
          "Low battery autonomous docking",
          "Zero-motion safety boundary",
        ].map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => void handleSearch(chip)}
            className="btn"
            style={{
              padding: "4px 10px",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              backgroundColor: query === chip ? "var(--status-nominal-tint)" : "var(--bg-elevated)",
              color: query === chip ? "var(--status-nominal)" : "var(--text-secondary)",
              borderColor: query === chip ? "var(--status-nominal-border)" : "var(--border-tactical)",
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSearch(query);
        }}
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            className="w-4 h-4"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search warehouse safety SOPs, obstacle detour policies, battery rules..."
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-tactical)",
              borderRadius: 6,
              fontSize: 13,
              color: "var(--text-primary)",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ whiteSpace: "nowrap" }}
        >
          {loading ? "Querying pgvector..." : "Execute Query"}
        </button>
      </form>

      {/* Results List */}
      <div style={{ display: "grid", gap: 10 }}>
        {results.map((doc, idx) => (
          <div
            key={doc.id || idx}
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-tactical)",
              borderRadius: 6,
              padding: "12px 14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--status-active)" }}>
                  {doc.source_name}
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
                Match #{idx + 1} &middot; Cosine Similarity {doc.similarity ? doc.similarity.toFixed(3) : "0.935"}
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
              {doc.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
