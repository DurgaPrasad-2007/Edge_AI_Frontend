"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Database, FileText } from "lucide-react";

interface VectorResult {
  id: string;
  source_name: string;
  content: string;
  similarity?: number | null;
}

const apiBase = process.env.NEXT_PUBLIC_EDGE_API_BASE_URL ?? "http://localhost:8000";

// Example queries only; results always come from the backend's knowledge table.
const QUICK_QUERIES = [
  "Corridor C-14 choke point arbitration",
  "Aisle B-07 obstacle detour",
  "Low battery autonomous docking",
  "Zero-motion safety boundary",
];

export function RagSearch() {
  const [query, setQuery] = useState(QUICK_QUERIES[0]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VectorResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const handleSearch = useCallback(async (q: string) => {
    setLoading(true);
    setQuery(q);
    setError(null);
    const started = performance.now();
    try {
      const res = await fetch(`${apiBase}/api/knowledge/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, limit: 3 }),
      });
      if (!res.ok) throw new Error(`Knowledge search failed (HTTP ${res.status})`);
      setResults((await res.json()) as VectorResult[]);
      setLatencyMs(Math.round(performance.now() - started));
    } catch (err) {
      setResults([]);
      setLatencyMs(null);
      setError(err instanceof Error && err.message.startsWith("Knowledge") ? err.message : "Backend unreachable — knowledge base unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void handleSearch(QUICK_QUERIES[0]);
  }, [handleSearch]);

  return (
    <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-tactical)", borderRadius: 8, padding: "24px", marginTop: 24, boxShadow: "var(--shadow-card)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Database className="w-4 h-4" style={{ color: "var(--solar-terracotta)" }} />
            <span className="font-mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--solar-terracotta)", letterSpacing: "0.05em" }}>
              VECTOR KNOWLEDGE BASE
            </span>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Incident &amp; SOP Knowledge Base</h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
            384-dimensional hashed bag-of-words embeddings, ranked by cosine similarity. Lexical matching: queries share vocabulary with the SOP text.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <span className="badge badge-nominal">cosine search</span>
          {latencyMs !== null && <span className="badge badge-active">{latencyMs}ms round-trip</span>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {QUICK_QUERIES.map((chip) => {
          const isActive = query === chip;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => void handleSearch(chip)}
              className="btn"
              style={{
                padding: "5px 12px",
                fontSize: 11.5,
                fontWeight: isActive ? 700 : 500,
                fontFamily: "var(--font-mono)",
                backgroundColor: isActive ? "var(--status-active-tint)" : "var(--bg-elevated)",
                color: isActive ? "var(--status-active)" : "var(--text-secondary)",
                border: `1px solid ${isActive ? "var(--status-active)" : "var(--border-tactical)"}`,
                borderRadius: 5,
                transition: "all 0.15s ease",
              }}
            >
              {chip}
            </button>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSearch(query);
        }}
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <Search className="w-4 h-4" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search warehouse safety SOPs, obstacle detour policies, battery rules..."
            style={{ width: "100%", padding: "10px 14px 10px 38px", backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-tactical)", borderRadius: 6, fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
          {loading ? "Searching…" : "Execute Query"}
        </button>
      </form>

      {error && (
        <div role="alert" style={{ color: "#EF4444", fontSize: 12, fontFamily: "var(--font-mono)", marginBottom: 10 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {results.map((doc, idx) => (
          <div
            key={doc.id || idx}
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderLeft: "3.5px solid var(--solar-terracotta)",
              borderRadius: 6,
              padding: "13px 16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-mono" style={{ fontSize: 12.5, fontWeight: 800, color: "var(--solar-terracotta)", letterSpacing: "0.02em" }}>
                  {doc.source_name}
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>
                Match #{idx + 1}
                {typeof doc.similarity === "number" ? ` · Cosine Similarity ${doc.similarity.toFixed(3)}` : ""}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.55, margin: 0 }}>{doc.content}</p>
          </div>
        ))}

        {!loading && !error && results.length === 0 && (
          <div style={{ color: "var(--text-muted)", fontSize: 12 }}>No matching knowledge chunks.</div>
        )}
      </div>
    </div>
  );
}
