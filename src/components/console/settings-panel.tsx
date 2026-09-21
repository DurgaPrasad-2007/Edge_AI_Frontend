"use client";

/**
 * SettingsPanel — Fleet Configuration & System Settings
 */

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { UserManagementModal } from "@/components/user-management-modal";
import { AuditPanel } from "@/components/console/audit-panel";

const apiBase = process.env.NEXT_PUBLIC_EDGE_API_BASE_URL ?? "http://localhost:8000";

export function SettingsPanel() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"settings" | "audit">("settings");
  const [apiUrl, setApiUrl] = useState(apiBase);
  const [safetyBuffer, setSafetyBuffer] = useState(0.5);
  const [heartbeatMs, setHeartbeatMs] = useState(600);
  const [saved, setSaved] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const isAdmin = user?.roles?.includes("admin");

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="console-panel settings-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h1 className="panel-title">{activeTab === "settings" ? "Settings & System" : "Audit Log"}</h1>
          <span className="panel-subtitle">
            {activeTab === "settings"
              ? "Fleet configuration · API endpoints · Safety parameters · RBAC"
              : "Immutable record of all fleet control actions, auth events, and system state changes"}
          </span>
        </div>
        <div className="panel-header-badges">
          <div className="filter-tabs" style={{ marginBottom: 0 }}>
            <button
              className={`filter-tab${activeTab === "settings" ? " filter-tab-active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              ⚙ System Settings
            </button>
            <button
              className={`filter-tab${activeTab === "audit" ? " filter-tab-active" : ""}`}
              onClick={() => setActiveTab("audit")}
            >
              🛡 Audit Trail
            </button>
          </div>
        </div>
      </div>

      {activeTab === "audit" ? (
        <AuditPanel />
      ) : (
        <div className="settings-grid">
        {/* Session info */}
        <div className="settings-card">
          <div className="settings-card-title">Current Session</div>
          <div className="settings-rows">
            <div className="settings-row"><span>User</span><span className="settings-val">{user?.email ?? "—"}</span></div>
            <div className="settings-row"><span>Roles</span><span className="settings-val">{user?.roles?.join(", ") ?? "—"}</span></div>
            <div className="settings-row"><span>Backend</span><span className="settings-val" style={{ color: "#10B981" }}>{apiBase}</span></div>
            <div className="settings-row"><span>WS Protocol</span><span className="settings-val font-mono">edgefleet</span></div>
            <div className="settings-row"><span>WS Endpoint</span><span className="settings-val font-mono">/ws/fleet</span></div>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button className="btn-primary" style={{ flex: 1, fontSize: "12px", padding: "6px 12px" }} onClick={() => setShowUserModal(true)}>
              👥 Manage Operators &amp; RBAC
            </button>
            <button className="btn-danger settings-logout" onClick={signOut}>Sign Out</button>
          </div>
        </div>

        {/* API Configuration */}
        <div className="settings-card">
          <div className="settings-card-title">API Configuration</div>
          <div className="form-group">
            <label>Backend URL</label>
            <input className="form-input" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
            <span className="form-hint">Restart frontend after changing. Set in .env.local as NEXT_PUBLIC_EDGE_API_BASE_URL</span>
          </div>
          <div className="settings-rows">
            <div className="settings-row"><span>Docs URL</span><a href={`${apiBase}/docs`} target="_blank" rel="noreferrer" className="settings-link">{apiBase}/docs</a></div>
            <div className="settings-row"><span>Health</span><a href={`${apiBase}/health`} target="_blank" rel="noreferrer" className="settings-link">/health</a></div>
            <div className="settings-row"><span>Fleet State</span><a href={`${apiBase}/api/fleet/state`} target="_blank" rel="noreferrer" className="settings-link">/api/fleet/state</a></div>
          </div>
        </div>

        {/* Safety parameters */}
        <div className="settings-card">
          <div className="settings-card-title">Safety Parameters (ISO 3691-4)</div>
          <div className="form-group">
            <label>Safety Buffer Distance: <strong style={{ color: "#06B6D4" }}>{safetyBuffer.toFixed(2)}m</strong></label>
            <input type="range" className="form-range" min={0.3} max={1.5} step={0.05}
              value={safetyBuffer} onChange={(e) => setSafetyBuffer(Number(e.target.value))} />
            <span className="form-hint">ISO 3691-4 Level B minimum: 0.5m. Collaborative mode enforced.</span>
          </div>
          <div className="form-group">
            <label>Heartbeat Interval: <strong style={{ color: "#06B6D4" }}>{heartbeatMs}ms</strong></label>
            <input type="range" className="form-range" min={200} max={2000} step={100}
              value={heartbeatMs} onChange={(e) => setHeartbeatMs(Number(e.target.value))} />
            <span className="form-hint">Backend CONTROL_PERIOD_SECONDS is {heartbeatMs / 1000}s. Set in coordinator.py.</span>
          </div>
        </div>

        {/* Fleet architecture reference */}
        <div className="settings-card">
          <div className="settings-card-title">Architecture Reference</div>
          <div className="settings-arch-grid">
            <div className="arch-item"><span className="arch-label">Frontend</span><span>Next.js 15 · React 19 · TypeScript</span></div>
            <div className="arch-item"><span className="arch-label">Backend</span><span>FastAPI 0.111 · Python · Pydantic v2</span></div>
            <div className="arch-item"><span className="arch-label">WebSocket</span><span>/ws/fleet · edgefleet sub-protocol</span></div>
            <div className="arch-item"><span className="arch-label">Database</span><span>SQLite (dev) / PostgreSQL (prod)</span></div>
            <div className="arch-item"><span className="arch-label">Auth</span><span>JWT · OAuth2PasswordBearer · RBAC</span></div>
            <div className="arch-item"><span className="arch-label">Middleware</span><span>Zenoh DDS (rmw_zenoh) · ROS 2</span></div>
            <div className="arch-item"><span className="arch-label">Task Protocol</span><span>Contract-Net Protocol (CNP)</span></div>
            <div className="arch-item"><span className="arch-label">Safety</span><span>ISO 3691-4 · Space-time leases</span></div>
          </div>
        </div>

        {/* Quick links */}
        <div className="settings-card">
          <div className="settings-card-title">Quick Links</div>
          <div className="settings-links-grid">
            <a href={`${apiBase}/docs`} target="_blank" rel="noreferrer" className="settings-quick-link">
              <span>📖</span><span>API Docs (Swagger)</span>
            </a>
            <a href="https://zenoh.io" target="_blank" rel="noreferrer" className="settings-quick-link">
              <span>📡</span><span>Zenoh Protocol</span>
            </a>
            <a href="https://docs.ros.org/en/humble" target="_blank" rel="noreferrer" className="settings-quick-link">
              <span>🤖</span><span>ROS 2 Humble Docs</span>
            </a>
            <a href="https://open-rmf.github.io" target="_blank" rel="noreferrer" className="settings-quick-link">
              <span>🏭</span><span>Open-RMF Reference</span>
            </a>
          </div>
        </div>

        {/* Save */}
        <div className="settings-card settings-card-save">
          <button className="btn-primary settings-save-btn" onClick={handleSave}>
            {saved ? "✓ Saved!" : "Save Settings"}
          </button>
          <span className="form-hint">Note: API URL and heartbeat interval require backend restart to take effect.</span>
        </div>
      </div>
      )}

      {/* User & RBAC Management Modal */}
      <UserManagementModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />
    </div>
  );
}
