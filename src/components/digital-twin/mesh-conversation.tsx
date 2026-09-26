"use client";

import { useState } from "react";
import { ChevronDown, EyeOff } from "lucide-react";
import type { P2PMessagePacket } from "@/lib/use-fleet-socket";

const TYPE_LABEL: Record<string, string> = {
  MUTEX_REQ: "asks for lease",
  MUTEX_GRANT: "lease",
  YIELD_ACK: "yields",
  OBSTACLE_ALERT: "alert",
  TASK_BID: "auction",
  HEARTBEAT: "heartbeat",
};

/** What the robots actually said to each other, newest first. Every line is a real message from the peer bus. */
export function MeshConversation({
  messages,
  robotColor,
  onClose,
}: {
  messages: P2PMessagePacket[];
  robotColor: (id?: string | null) => string;
  onClose?: () => void;
}) {
  const [showHeartbeats, setShowHeartbeats] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const shown = messages.filter((m) => showHeartbeats || m.type !== "HEARTBEAT").slice(0, 14);

  return (
    <div
      className="card-hairline"
      style={{
        marginTop: 16,
        padding: isCollapsed ? "10px 16px" : "14px 16px",
        transition: "all 0.2s ease",
      }}
      aria-label="Robot-to-robot messages"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: isCollapsed ? 0 : 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => setIsCollapsed((v) => !v)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "inherit",
              font: "inherit",
            }}
            title={isCollapsed ? "Expand Mesh Conversation" : "Collapse Mesh Conversation"}
          >
            <ChevronDown
              className="w-4 h-4"
              style={{
                transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                color: "var(--text-muted)",
              }}
            />
            <strong style={{ fontSize: 13 }}>Mesh Conversation</strong>
          </button>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {isCollapsed
              ? `(${shown.length} peer messages · click to expand)`
              : "what the robots relay to each other, live"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!isCollapsed && (
            <label
              style={{
                fontSize: 11,
                color: "var(--text-secondary)",
                display: "flex",
                gap: 6,
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={showHeartbeats}
                onChange={(e) => setShowHeartbeats(e.target.checked)}
              />{" "}
              show heartbeats
            </label>
          )}

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{
                padding: "3px 8px",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                gap: 5,
                height: 25,
                borderRadius: 4,
              }}
              title="Hide Mesh Conversation panel (can be re-enabled from toolbar)"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCollapsed((v) => !v)}
              className="btn btn-secondary"
              style={{
                padding: "3px 8px",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                gap: 4,
                height: 25,
                borderRadius: 4,
              }}
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              <span>{isCollapsed ? "Expand" : "Collapse"}</span>
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        shown.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--text-muted)", paddingTop: 4 }}>
            No messages yet. Start a scenario and watch the robots negotiate.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 4, fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
            {shown.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "58px 150px 96px 1fr",
                  gap: 8,
                  alignItems: "baseline",
                  padding: "3px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>{m.timestamp}</span>
                <span style={{ fontWeight: 700 }}>
                  <span style={{ color: robotColor(m.sender) }}>{m.sender}</span>
                  <span style={{ color: "var(--text-muted)" }}> → </span>
                  <span style={{ color: m.recipient === "MESH" ? "var(--text-muted)" : robotColor(m.recipient) }}>
                    {m.recipient === "MESH" ? "everyone" : m.recipient}
                  </span>
                </span>
                <span style={{ color: "var(--status-active)" }}>{TYPE_LABEL[m.type] ?? m.type}</span>
                <span style={{ color: "var(--text-primary)", wordBreak: "break-word" }}>{m.payload}</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
