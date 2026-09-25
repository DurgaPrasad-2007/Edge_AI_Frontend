"use client";

/**
 * SettingsPanel — session, backend status and the coordinator's active parameters.
 * Everything here is read from the backend; there are no local sliders pretending to configure it.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useFleetSocket } from "@/lib/use-fleet-socket";
import { UserManagementModal } from "@/components/user-management-modal";
import { AuditPanel } from "@/components/console/audit-panel";
import { FleetStatusBanner } from "@/components/fleet-status-banner";
import { Settings, ShieldCheck, Users, BookOpen } from "lucide-react";

const apiBase = process.env.NEXT_PUBLIC_EDGE_API_BASE_URL ?? "http://localhost:8000";

interface Health {
  status: string;
  version: string;
  environment: string;
  database: { connected: boolean; dialect: string };
  fleet_size: number;
  simulation_running: boolean;
}

export function SettingsPanel() {
  const { user, signOut } = useAuth();
  const { world, isConnected, fleetState } = useFleetSocket();
  const [activeTab, setActiveTab] = useState<"settings" | "audit">("settings");
  const [showUserModal, setShowUserModal] = useState(false);
  const [health, setHealth] = useState<Health | null>(null);

  const isAdmin = user?.roles?.includes("admin");

  useEffect(() => {
    let cancelled = false;
    fetch(`${apiBase}/health`)
      .then((res) => (res.ok ? (res.json() as Promise<Health>) : null))
      .then((data) => {
        if (!cancelled) setHealth(data);
      })
      .catch(() => {
        if (!cancelled) setHealth(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isConnected]);

  const config = world?.config;

  return (
    <div className="console-panel settings-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h1 className="panel-title">{activeTab === "settings" ? "Settings & System" : "Audit Log"}</h1>
          <span className="panel-subtitle">
            {activeTab === "settings" ? "Session · backend status · active coordinator parameters · RBAC" : "Persisted record of fleet control actions, task lifecycle, logins and admin changes"}
          </span>
        </div>
        <div className="panel-header-badges">
          <div className="filter-tabs" style={{ marginBottom: 0 }}>
            <button className={`filter-tab${activeTab === "settings" ? " filter-tab-active" : ""}`} onClick={() => setActiveTab("settings")}>
              <Settings className="w-3.5 h-3.5 inline mr-1.5" />
              System Settings
            </button>
            <button className={`filter-tab${activeTab === "audit" ? " filter-tab-active" : ""}`} onClick={() => setActiveTab("audit")}>
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1.5" />
              Audit Trail
            </button>
          </div>
        </div>
      </div>

      <FleetStatusBanner />

      {activeTab === "audit" ? (
        <AuditPanel />
      ) : (
        <div className="settings-grid">
          <div className="settings-card">
            <div className="settings-card-title">Current Session</div>
            <div className="settings-rows">
              <div className="settings-row"><span>User</span><span className="settings-val">{user?.email ?? "—"}</span></div>
              <div className="settings-row"><span>Roles</span><span className="settings-val">{user?.roles?.join(", ") ?? "—"}</span></div>
              <div className="settings-row"><span>Backend</span><span className="settings-val" style={{ color: isConnected ? "#10B981" : "#F59E0B" }}>{apiBase} · {isConnected ? "connected" : "offline"}</span></div>
              <div className="settings-row"><span>Live stream</span><span className="settings-val font-mono">/ws/fleet · seq {fleetState?.seq ?? "—"}</span></div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              {isAdmin && (
                <button className="btn-primary" style={{ flex: 1, fontSize: "12px", padding: "6px 12px" }} onClick={() => setShowUserModal(true)}>
                  <Users className="w-3.5 h-3.5 inline mr-1.5" />
                  Manage Operators &amp; RBAC
                </button>
              )}
              <button className="btn-danger settings-logout" onClick={signOut}>Sign Out</button>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-card-title">Backend Status</div>
            {health ? (
              <div className="settings-rows">
                <div className="settings-row"><span>Service</span><span className="settings-val">{health.status} · v{health.version}</span></div>
                <div className="settings-row"><span>Environment</span><span className="settings-val">{health.environment}</span></div>
                <div className="settings-row"><span>Database</span><span className="settings-val">{health.database.dialect} · {health.database.connected ? "connected" : "down"}</span></div>
                <div className="settings-row"><span>Fleet size</span><span className="settings-val">{health.fleet_size} AMRs</span></div>
                <div className="settings-row"><span>Simulation</span><span className="settings-val">{health.simulation_running ? "running" : "paused"}</span></div>
              </div>
            ) : (
              <div className="form-hint">Backend health is unavailable.</div>
            )}
            <span className="form-hint">Set the backend URL with NEXT_PUBLIC_EDGE_API_BASE_URL in .env.local and restart the frontend.</span>
          </div>

          <div className="settings-card">
            <div className="settings-card-title">Coordinator Parameters (read-only)</div>
            {config ? (
              <div className="settings-rows">
                <div className="settings-row"><span>Control tick</span><span className="settings-val">{Math.round(config.control_period_s * 1000)} ms</span></div>
                <div className="settings-row"><span>Seek charger below</span><span className="settings-val">{config.low_battery_pct}% battery</span></div>
                <div className="settings-row"><span>Minimum to bid</span><span className="settings-val">{config.min_bid_battery_pct}% battery</span></div>
                <div className="settings-row"><span>Proximity threshold</span><span className="settings-val">{config.collision_radius} map units</span></div>
                <div className="settings-row"><span>Mutex zones</span><span className="settings-val">{world?.mutex_zones.join(", ") || "none"}</span></div>
                <div className="settings-row"><span>Warehouse graph</span><span className="settings-val">{world?.nodes.length} nodes · {world?.edges.length} lanes</span></div>
              </div>
            ) : (
              <div className="form-hint">Waiting for the backend to publish its configuration.</div>
            )}
            <span className="form-hint">These values are defined in the backend (app/coordinator.py, app/graph.py) and change only with a deploy.</span>
          </div>

          <div className="settings-card">
            <div className="settings-card-title">Quick Links</div>
            <div className="settings-links-grid">
              <a href={`${apiBase}/docs`} target="_blank" rel="noreferrer" className="settings-quick-link">
                <BookOpen className="w-4 h-4 text-[var(--accent-cyan)]" />
                <span>API Docs (Swagger)</span>
              </a>
              <a href={`${apiBase}/health`} target="_blank" rel="noreferrer" className="settings-quick-link">
                <ShieldCheck className="w-4 h-4 text-[var(--status-nominal)]" />
                <span>Health endpoint</span>
              </a>
            </div>
          </div>
        </div>
      )}

      <UserManagementModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />
    </div>
  );
}
