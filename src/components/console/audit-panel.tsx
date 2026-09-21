"use client";

/**
 * AuditPanel — Searchable audit trail for all console actions
 */

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { useFleetSocket } from "@/lib/use-fleet-socket";

type AuditEntry = {
  id: string;
  ts: string;
  type: "AUTH" | "CONTROL" | "TASK" | "CONFIG" | "SYSTEM";
  actor: string;
  action: string;
  detail: string;
};

const TYPE_COLORS: Record<string, string> = {
  AUTH: "#06B6D4",
  CONTROL: "#A855F7",
  TASK: "#10B981",
  CONFIG: "#F59E0B",
  SYSTEM: "#64748B",
};

const TYPE_ICONS: Record<string, string> = {
  AUTH: "🔐",
  CONTROL: "⚡",
  TASK: "📦",
  CONFIG: "⚙",
  SYSTEM: "💻",
};

function AuditRow({ entry }: { entry: AuditEntry }) {
  const color = TYPE_COLORS[entry.type] ?? "#64748B";
  return (
    <tr className="audit-row">
      <td className="audit-ts">{entry.ts}</td>
      <td>
        <span className="audit-type-badge" style={{ color, borderColor: `${color}40`, background: `${color}10` }}>
          {TYPE_ICONS[entry.type]} {entry.type}
        </span>
      </td>
      <td className="audit-actor">{entry.actor}</td>
      <td className="audit-action">{entry.action}</td>
      <td className="audit-detail">{entry.detail}</td>
    </tr>
  );
}

export function AuditPanel() {
  const { user, session } = useAuth();
  const { events, isConnected } = useFleetSocket(session?.access_token);
  const [log, setLog] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | AuditEntry["type"]>("ALL");
  const counterRef = useRef(1);
  const seenMessagesRef = useRef<Set<string>>(new Set());

  // Record real WebSocket events into the audit log
  useEffect(() => {
    if (!events || events.length === 0) return;
    const newEntries: AuditEntry[] = [];
    for (const ev of events) {
      const key = `${ev.time}-${ev.type}-${ev.message}`;
      if (!seenMessagesRef.current.has(key)) {
        seenMessagesRef.current.add(key);
        newEntries.push({
          id: `A${String(counterRef.current++).padStart(3, "0")}`,
          ts: ev.time,
          type: ev.type === "LEASE" || ev.type === "INTENT" ? "CONTROL" : ev.type === "HANDOFF" ? "TASK" : "SYSTEM",
          actor: "Coordinator",
          action: ev.type,
          detail: ev.message,
        });
      }
    }
    if (newEntries.length > 0) {
      setLog((prev) => [...newEntries, ...prev].slice(0, 300));
    }
  }, [events]);

  const filtered = log
    .filter((e) => typeFilter === "ALL" || e.type === typeFilter)
    .filter((e) => !search || [e.action, e.actor, e.detail].some((f) => f.toLowerCase().includes(search.toLowerCase())));

  function exportCSV() {
    const header = "Timestamp,Type,Actor,Action,Detail\n";
    const rows = filtered.map((e) => `${e.ts},${e.type},${e.actor},${e.action},"${e.detail}"`).join("\n");
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
          <span className="panel-subtitle">Immutable record of all fleet control actions, auth events, and system state changes</span>
        </div>
        <div className="panel-header-actions">
          <button className="btn-ghost" onClick={exportCSV}>⬇ Export CSV</button>
        </div>
      </div>

      <div className="audit-filter-bar">
        <input className="comms-search" placeholder="Search actions, actors, details…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="audit-type-filters">
          {(["ALL", "AUTH", "CONTROL", "TASK", "CONFIG", "SYSTEM"] as const).map((t) => (
            <button key={t}
              className={`comms-filter-chip${typeFilter === t ? " active" : ""}`}
              style={typeFilter === t && t !== "ALL" ? { borderColor: TYPE_COLORS[t], color: TYPE_COLORS[t] } : {}}
              onClick={() => setTypeFilter(t)}>
              {t !== "ALL" && TYPE_ICONS[t]} {t}
            </button>
          ))}
        </div>
      </div>

      <div className="audit-count-bar">
        Showing {filtered.length} of {log.length} entries
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
                  {log.length === 0
                    ? "Awaiting live fleet actions · Events stream in real-time from backend WebSocket..."
                    : "No matching audit entries found for search filter"}
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
