"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "./auth-provider";

type ManagedUser = {
  id: string;
  email: string;
  roles: string[];
  active: boolean;
  created_at: string;
};

const apiBase = process.env.NEXT_PUBLIC_EDGE_API_BASE_URL ?? "http://localhost:8000";

export function UserManagementModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const auth = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create form state
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["operator"]);
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    if (!auth.session) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/api/users`, {
        headers: { Authorization: `Bearer ${auth.session.access_token}` },
      });
      if (!res.ok) {
        throw new Error(res.status === 403 ? "Admin privileges required to manage users" : "Failed to load users");
      }
      setUsers(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users from EdgeFleet API");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (isOpen) {
      void fetchUsers();
    }
  }, [isOpen, auth.session]);

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth.session) return;
    setCreating(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${apiBase}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.session.access_token}`,
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          roles: selectedRoles,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to create user");
      }
      setSuccess(`Operator ${newEmail} provisioned successfully into PostgreSQL!`);
      setNewEmail("");
      setNewPassword("");
      setSelectedRoles(["operator"]);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Creation failed");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (user: ManagedUser) => {
    if (!auth.session) return;
    try {
      const res = await fetch(`${apiBase}/api/users/${user.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.session.access_token}`,
        },
        body: JSON.stringify({ active: !user.active }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Status update failed");
      }
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle status");
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!auth.session) return;
    if (!confirm(`Are you sure you want to permanently delete user ${email} from PostgreSQL?`)) return;
    try {
      const res = await fetch(`${apiBase}/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.session.access_token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Deletion failed");
      }
      setSuccess(`User ${email} deleted.`);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(3, 7, 18, 0.85)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "840px",
          maxHeight: "90vh",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-tactical)",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-tactical)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--bg-void)",
          }}
        >
          <div>
            <span className="font-mono" style={{ fontSize: "11px", color: "var(--accent-emerald)", letterSpacing: "0.08em" }}>
              SECURITY / IDENTITY &amp; RBAC MANAGEMENT
            </span>
            <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "2px 0 0" }}>
              PostgreSQL User Directory &amp; Roles
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono"
            style={{
              background: "transparent",
              border: "1px solid var(--border-tactical)",
              borderRadius: "4px",
              color: "var(--text-secondary)",
              padding: "4px 10px",
              cursor: "pointer",
            }}
          >
            ESC
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "4px", color: "#F43F5E", fontSize: "12px" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ padding: "10px 14px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "4px", color: "var(--accent-emerald)", fontSize: "12px" }}>
              {success}
            </div>
          )}

          {/* User List Table */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span className="font-mono" style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)" }}>
                Registered Accounts in PostgreSQL ({users.length})
              </span>
              <button
                type="button"
                onClick={() => void fetchUsers()}
                className="font-mono"
                style={{ fontSize: "11px", background: "transparent", border: "none", color: "var(--accent-emerald)", cursor: "pointer" }}
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="font-mono" style={{ fontSize: "12px", color: "var(--text-muted)" }}>Loading PostgreSQL identities...</p>
            ) : (
              <div style={{ border: "1px solid var(--border-tactical)", borderRadius: "4px", overflow: "hidden" }}>
                <table className="benchmark-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Assigned Roles</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const isSelf = auth.user?.email === u.email;
                      return (
                        <tr key={u.id}>
                          <td>
                            <b>{u.email}</b> {isSelf && <span style={{ fontSize: "10px", color: "var(--accent-emerald)" }}>(You)</span>}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                              {u.roles.map((r) => (
                                <span
                                  key={r}
                                  className="badge"
                                  style={{
                                    fontSize: "9px",
                                    padding: "2px 6px",
                                    background:
                                      r === "admin"
                                        ? "rgba(244,63,94,0.15)"
                                        : r === "operator"
                                        ? "rgba(245,158,11,0.15)"
                                        : "rgba(59,130,246,0.15)",
                                    color:
                                      r === "admin"
                                        ? "#F43F5E"
                                        : r === "operator"
                                        ? "#F59E0B"
                                        : "#60A5FA",
                                    border: "1px solid var(--border-tactical)",
                                  }}
                                >
                                  {r.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                fontSize: "10px",
                                color: u.active ? "var(--accent-emerald)" : "var(--accent-rose)",
                              }}
                            >
                              {u.active ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </td>
                          <td className="font-mono" style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {!isSelf && (
                              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                                <button
                                  type="button"
                                  onClick={() => void handleToggleStatus(u)}
                                  className="font-mono"
                                  style={{
                                    padding: "2px 8px",
                                    fontSize: "10px",
                                    borderRadius: "3px",
                                    background: "transparent",
                                    border: "1px solid var(--border-tactical)",
                                    color: u.active ? "var(--accent-amber)" : "var(--accent-emerald)",
                                    cursor: "pointer",
                                  }}
                                >
                                  {u.active ? "Deactivate" : "Activate"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteUser(u.id, u.email)}
                                  className="font-mono"
                                  style={{
                                    padding: "2px 8px",
                                    fontSize: "10px",
                                    borderRadius: "3px",
                                    background: "transparent",
                                    border: "1px solid rgba(244,63,94,0.4)",
                                    color: "var(--accent-rose)",
                                    cursor: "pointer",
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Provision New User Form */}
          <div style={{ background: "var(--bg-void)", border: "1px solid var(--border-tactical)", borderRadius: "6px", padding: "16px" }}>
            <span className="font-mono" style={{ fontSize: "11px", color: "var(--accent-emerald)", letterSpacing: "0.08em" }}>
              PROVISION OPERATOR
            </span>
            <h3 style={{ fontSize: "14px", fontWeight: "700", marginTop: "2px", marginBottom: "12px" }}>
              Create New Account &amp; Assign RBAC Roles
            </h3>

            <form onSubmit={handleCreateUser} style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="operator@bel.gov.in"
                    style={{
                      width: "100%",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-tactical)",
                      borderRadius: "4px",
                      padding: "8px 10px",
                      fontSize: "12px",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Initial Password (min 12 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={12}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 12 characters"
                    style={{
                      width: "100%",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-tactical)",
                      borderRadius: "4px",
                      padding: "8px 10px",
                      fontSize: "12px",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Roles Checkboxes */}
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Assigned RBAC Roles (at least 1 required)
                </label>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {(["viewer", "operator", "admin", "fleet-agent"] as const).map((role) => (
                    <label
                      key={role}
                      className="font-mono"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11px",
                        cursor: "pointer",
                        color: selectedRoles.includes(role) ? "var(--text-primary)" : "var(--text-muted)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role)}
                        onChange={() => toggleRole(role)}
                      />
                      {role.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                <button
                  type="submit"
                  disabled={creating || selectedRoles.length === 0}
                  className="btn btn-primary font-mono"
                  style={{ fontSize: "12px", padding: "8px 16px" }}
                >
                  {creating ? "Provisioning in PostgreSQL..." : "Provision User"}
                </button>
              </div>
            </form>
          </div>

          {/* RBAC Reference Guide */}
          <div style={{ padding: "12px 14px", background: "var(--bg-void)", border: "1px solid var(--border-tactical)", borderRadius: "4px" }}>
            <span className="font-mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              ROLE-BASED ACCESS CONTROL (RBAC) GOVERNANCE
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginTop: "8px" }}>
              <div>
                <b style={{ fontSize: "11px", color: "#F43F5E" }}>ADMIN</b>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                  Full authority. User provisioning, audit trails, and configuration.
                </p>
              </div>
              <div>
                <b style={{ fontSize: "11px", color: "#F59E0B" }}>OPERATOR</b>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                  Task creation/bidding, route blockages, and SOP management.
                </p>
              </div>
              <div>
                <b style={{ fontSize: "11px", color: "#60A5FA" }}>VIEWER</b>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                  Read-only access to floor twin, live telemetry, and pgvector SOP search.
                </p>
              </div>
              <div>
                <b style={{ fontSize: "11px", color: "var(--accent-emerald)" }}>FLEET-AGENT</b>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                  Machine-to-machine AMR node authorization for corridor leases &amp; intents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
