"use client";

/**
 * AuditPanel — reads the persisted audit trail (GET /api/audit).
 * Every row was written by the backend with the authenticated actor; nothing is built client-side.
 */

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";
import { useFleetSocket } from "@/lib/use-fleet-socket";
import { KeyRound, Zap, Package, Settings, Terminal } from "lucide-react";

type AuditCategory = "AUTH" | "CONTROL" | "TASK" | "CONFIG" | "SYSTEM";

interface AuditEntry {
  id: number;
  created_at: string;
  actor: string;
  category: AuditCategory;
  event_type: string | null;
  sim_time: string | null;
  message: string;
}

const apiBase = process.env.NEXT_PUBLIC_EDGE_API_BASE_URL ?? "http://localhost:8000";

const TYPE_COLORS: Record<string, string> = {
  AUTH: "#06B6D4",
  CONTROL: "#A855F7",
  TASK: "#10B981",
  CONFIG: "#F59E0B",
  SYSTEM: "#64748B",
};

const TYPE_ICONS: Record<string, ReactNode> = {
  AUTH: <KeyRound className="w-3 h-3" />,
  CONTROL: <Zap className="w-3 h-3" />,
  TASK: <Package className="w-3 h-3" />,
  CONFIG: <Settings className="w-3 h-3" />,
  SYSTEM: <Terminal className="w-3 h-3" />,
};

function AuditRow({ entry }: { entry: AuditEntry }) {
  const color = TYPE_COLORS[entry.category] ?? "#64748B";
  return (
    <tr className="audit-row">
      <td className="audit-ts">{new Date(entry.created_at).toLocaleTimeString("en-US", { hour12: false })}</td>
      <td>
        <span className="audit-type-badge inline-flex items-center gap-1.5" style={{ color, borderColor: `${color}40`, background: `${color}10` }}>
          {TYPE_ICONS[entry.category]}
          <span>{entry.category}</span>
        </span>
      </td>
      <td className="audit-actor">{entry.actor}</td>
      <td className="audit-action">{entry.event_type ?? entry.category}</td>
      <td className="audit-detail">{entry.message}</td>
    </tr>
  );
}

export function AuditPanel() {
  const { session } = useAuth();
  const { events } = useFleetSocket();
  const token = session?.access_token ?? null;
  const [log, setLog] = useState<AuditEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | AuditCategory>("ALL");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/audit?limit=500`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLog((await res.json()) as AuditEntry[]);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "failed to load");
    }
  }, [token]);

  // Reload whenever the coordinator emits a new event (and once on mount).
  const latestEventId = events[0]?.id ?? 0;
  useEffect(() => {
    void load();
  }, [load, latestEventId]);

  const filtered = log
    .filter((e) => typeFilter === "ALL" || e.category === typeFilter)
    .filter((e) => !search || [e.event_type ?? "", e.actor, e.message].some((f) => f.toLowerCase().includes(search.toLowerCase())));

  function exportCSV() {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const header = "Timestamp,Category,Actor,Type,Detail\n";
    const rows = filtered.map((e) => [e.created_at, e.category, esc(e.actor), e.event_type ?? "", esc(e.message)].join(",")).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `edgefleet-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="console-panel audit-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h1 className="panel-title">Audit Log</h1>
          <span className="panel-subtitle">Persisted record of fleet control actions, task lifecycle, logins and admin changes — with the acting user</span>
        </div>
        <div className="panel-header-actions">
          <button className="btn-ghost" onClick={exportCSV}>⬇ Export CSV</button>
        </div>
      </div>

      <div className="audit-filter-bar">
        <input className="comms-search" placeholder="Search actions, actors, details…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="audit-type-filters">
          {(["ALL", "AUTH", "CONTROL", "TASK", "CONFIG", "SYSTEM"] as const).map((t) => (
            <button
              key={t}
              className={`comms-filter-chip${typeFilter === t ? " active" : ""}`}
              style={typeFilter === t && t !== "ALL" ? { borderColor: TYPE_COLORS[t], color: TYPE_COLORS[t] } : {}}
              onClick={() => setTypeFilter(t)}
            >
              {t !== "ALL" && TYPE_ICONS[t]} {t}
            </button>
          ))}
        </div>
      </div>

      <div className="audit-count-bar">
        Showing {filtered.length} of {log.length} entries {loadError && <span style={{ color: "#EF4444" }}>· could not refresh ({loadError})</span>}
      </div>

      <div className="audit-table-container">
        <table className="audit-table">
          <thead>
            <tr>
              <th>TIME</th><th>TYPE</th><th>ACTOR</th><th>ACTION</th><th>DETAIL</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="audit-empty" style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                  {log.length === 0 ? "No audit entries recorded yet." : "No matching audit entries found for search filter"}
                </td>
              </tr>
            ) : (
              filtered.map((e) => <AuditRow key={e.id} entry={e} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
