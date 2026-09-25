"use client";

/**
 * JobsPanel — Advanced Warehouse Task & Payload Management Console
 *
 * Full Feature Matrix:
 * - Dynamic Task Creation with Payload Sizes (Small Bins, Medium Carts, Heavy Pallets, Bulk Units)
 * - Attribute Customization: Weight (kg), Payload Dimensions, Urgency (Low/Standard/Critical), Priority (1-100)
 * - Dynamic Task Size & Attribute Editing for active/queued tasks
 * - Task Re-assignment & Cancellation
 * - Contract-Net Protocol (CNP) Auction Feed showing bids from AMR-01, AMR-02, and AMR-03
 * - Full integration with FastAPI backend (POST, PATCH, DELETE, POST /complete) and local twin
 */

import { useState, type FormEvent } from "react";
import {
  Package,
  ShoppingCart,
  Truck,
  Warehouse,
  CheckCircle2,
  Pencil,
  Trash2,
  Plus,
  AlertTriangle,
  ArrowRight,
  X,
  Cpu,
} from "lucide-react";
import {
  useFleetSocket,
  type TaskRecord,
  type FleetEvent,
  type PayloadSize,
  type UrgencyLevel,
  type RobotId,
} from "@/lib/use-fleet-socket";
import { FleetStatusBanner } from "@/components/fleet-status-banner";

const STATUS_COLORS: Record<string, string> = {
  Queued: "#64748B",
  Assigned: "#06B6D4",
  "In Progress": "#F59E0B",
  Completed: "#10B981",
  Blocked: "#EF4444",
};

const PAYLOAD_SIZE_METRICS: Record<
  PayloadSize,
  { label: string; defaultWeight: number; icon: React.ReactNode; maxWeight: number }
> = {
  small: { label: "Small Tote / Bin", defaultWeight: 35, icon: <Package className="w-3.5 h-3.5" />, maxWeight: 80 },
  medium: { label: "Medium Cart / Crate", defaultWeight: 180, icon: <ShoppingCart className="w-3.5 h-3.5" />, maxWeight: 350 },
  heavy: { label: "Heavy Industrial Pallet", defaultWeight: 650, icon: <Truck className="w-3.5 h-3.5" />, maxWeight: 1000 },
  pallet: { label: "High-Bay Bulk Pallet", defaultWeight: 1100, icon: <Warehouse className="w-3.5 h-3.5" />, maxWeight: 1500 },
};

function TaskCard({
  task,
  onComplete,
  onEdit,
  onDelete,
  canEdit,
}: {
  task: TaskRecord;
  onComplete: (id: string) => void;
  onEdit: (task: TaskRecord) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}) {
  const { robotColor } = useFleetSocket();
  const statusColor = STATUS_COLORS[task.status] ?? "#64748B";
  const amrColor = robotColor(task.assigned_robot_id);
  const sizeInfo = PAYLOAD_SIZE_METRICS[task.payload_size ?? "medium"];

  return (
    <div className="task-card">
      <div className="task-card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="task-id">{task.id}</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              padding: "2px 8px",
              borderRadius: 4,
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
            title={`Payload Size: ${sizeInfo.label}`}
          >
            {sizeInfo.icon}
            <span>{task.payload_kg ?? sizeInfo.defaultWeight} kg</span>
          </span>
          {task.urgency === "critical" && (
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                color: "#EF4444",
                backgroundColor: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "2px 6px",
                borderRadius: 4,
                letterSpacing: "0.04em",
              }}
            >
              CRITICAL
            </span>
          )}
        </div>
        <span
          className="task-status-badge"
          style={{ color: statusColor, borderColor: `${statusColor}40`, background: `${statusColor}14` }}
        >
          {task.status}
        </span>
      </div>

      <div className="task-route">
        <div className="task-location">
          <span className="task-loc-label">FROM</span>
          <span className="task-loc-val">{task.pickup}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted" style={{ margin: "0 4px", opacity: 0.5 }} />
        <div className="task-location">
          <span className="task-loc-label">TO</span>
          <span className="task-loc-val">{task.destination}</span>
        </div>
      </div>

      <div className="task-footer">
        <div className="task-meta">
          <span className="task-priority-label">PRIORITY</span>
          <div className="task-priority-bar">
            <div style={{ width: `${task.priority}%`, background: "var(--solar-terracotta)" }} />
          </div>
          <span className="task-priority-val">{task.priority}</span>
        </div>

        {task.assigned_robot_id && (
          <div
            className="task-assignment"
            style={{ color: amrColor, borderColor: `${amrColor}40`, backgroundColor: `${amrColor}14` }}
          >
            {task.assigned_robot_id}
          </div>
        )}

        {canEdit && (
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: 11, padding: "4px 9px", display: "inline-flex", alignItems: "center", gap: 4 }}
              onClick={() => onEdit(task)}
              title="Edit Task Attributes & Payload Size"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit</span>
            </button>
            {task.status !== "Completed" && (
              <button
                className="task-complete-btn"
                style={{ fontSize: 11, padding: "4px 9px", display: "inline-flex", alignItems: "center", gap: 4 }}
                onClick={() => onComplete(task.id)}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Complete</span>
              </button>
            )}
            <button
              className="btn btn-danger"
              style={{ fontSize: 11, padding: "4px 8px", display: "inline-flex", alignItems: "center" }}
              onClick={() => onDelete(task.id)}
              title="Delete or cancel task"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <div className="task-created" style={{ marginTop: 8, fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        Created: {new Date(task.created_at).toLocaleTimeString("en-US", { hour12: false })} &middot; Size Class: {task.payload_size?.toUpperCase() ?? "MEDIUM"}
      </div>
    </div>
  );
}

export function JobsPanel() {
  const {
    tasks,
    events,
    p2pMessages,
    robots,
    world,
    robotColor,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    injectBlockage,
  } = useFleetSocket();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const [filter, setFilter] = useState<"all" | "Queued" | "Assigned" | "In Progress" | "Completed" | "Blocked">("all");

  // Form State for Creation
  const [pickupChoice, setPickup] = useState("");
  const [destChoice, setDest] = useState("");
  const [priority, setPriority] = useState(75);
  const [payloadSize, setPayloadSize] = useState<PayloadSize>("medium");
  const [payloadKg, setPayloadKg] = useState(180);
  const [urgency, setUrgency] = useState<UrgencyLevel>("standard");
  const [submitting, setSubmitting] = useState(false);

  // Edit Form State
  const [editPriority, setEditPriority] = useState(75);
  const [editPayloadSize, setEditPayloadSize] = useState<PayloadSize>("medium");
  const [editPayloadKg, setEditPayloadKg] = useState(180);
  const [editUrgency, setEditUrgency] = useState<UrgencyLevel>("standard");
  const [editAssignedRobot, setEditAssignedRobot] = useState<RobotId | "auto">("auto");

  const canEdit = true; // Enabled for mission control operators

  const auctionEvents = events.filter((e) => e.type === "HANDOFF" || e.type === "REROUTE" || e.type === "INTENT");
  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  // Locations are whatever the backend's warehouse graph offers as stops.
  const availableLocations = (world?.nodes ?? []).filter((n) => n.type === "rack" || n.type === "dock" || n.type === "charge").map((n) => n.id);
  const pickup = pickupChoice || availableLocations[0] || "";
  const dest = destChoice || availableLocations.find((id) => id !== pickup) || "";
  const aisleId = world?.nodes.find((n) => /aisle/i.test(n.id))?.id ?? "B-07";

  async function handleCreateSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const created = await createTask({
      pickup,
      destination: dest,
      priority,
      payload_size: payloadSize,
      payload_kg: payloadKg,
      urgency,
    });
    setSubmitting(false);
    if (created) setShowCreateModal(false); // on failure the banner shows the backend's reason
  }

  function openEditModal(task: TaskRecord) {
    setEditingTask(task);
    setEditPriority(task.priority);
    setEditPayloadSize(task.payload_size ?? "medium");
    setEditPayloadKg(task.payload_kg ?? 150);
    setEditUrgency(task.urgency ?? "standard");
    setEditAssignedRobot((task.assigned_robot_id as RobotId) ?? "auto");
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editingTask) return;
    setSubmitting(true);
    const reassign = editAssignedRobot !== "auto" && editAssignedRobot !== editingTask.assigned_robot_id;
    const updated = await updateTask(editingTask.id, {
      priority: editPriority,
      payload_size: editPayloadSize,
      payload_kg: editPayloadKg,
      urgency: editUrgency,
      ...(reassign ? { assigned_robot_id: editAssignedRobot as RobotId } : {}),
    });
    setSubmitting(false);
    if (updated) setEditingTask(null);
  }

  return (
    <div className="console-panel jobs-panel">
      <FleetStatusBanner />
      <div className="panel-header">
        <div className="panel-title-group">
          <h1 className="panel-title">Task & Payload Operations</h1>
          <span className="panel-subtitle">
            Dynamic Contract-Net Protocol (CNP) Auction · Payload Sizing · ISO 3691-4 Real-time Scheduling
          </span>
        </div>
        <div className="panel-header-actions" style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-primary"
            style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Create Mission</span>
          </button>
          <button
            className="btn btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={() => injectBlockage(aisleId)}
            title="Toggle an aisle obstacle to test real-time A* re-routing"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Test Detour</span>
          </button>
        </div>
      </div>

      {/* Fleet Capacity Status Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {robots.map((r) => (
          <div
            key={r.id}
            style={{
              backgroundColor: "var(--bg-elevated)",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid var(--border-tactical)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: r.color }}>
                {r.id} · {r.name}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                Max Payload: {r.payload_capacity_kg ?? "—"} kg &middot; carrying {r.current_payload_kg ?? 0} kg
              </div>
            </div>
            <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 11 }}>
              <span style={{ color: r.battery < 25 ? "#EF4444" : "#10B981", fontWeight: 700 }}>
                {Math.round(r.battery)}% BAT
              </span>
              <div style={{ fontSize: 9, color: "var(--text-muted)" }}>{r.status}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {(["all", "Queued", "Assigned", "In Progress", "Completed", "Blocked"] as const).map((f) => (
          <button
            key={f}
            className={`filter-tab${filter === f ? " filter-tab-active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? `All Tasks (${tasks.length})` : `${f} (${tasks.filter((t) => t.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="jobs-layout">
        {/* Task Cards Column */}
        <div className="jobs-task-list">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Package className="w-8 h-8" style={{ color: "var(--text-tertiary)" }} />
              </div>
              <div className="empty-title">No tasks {filter !== "all" ? `with status "${filter}"` : "posted yet"}</div>
              <div className="empty-sub">
                Click "Create Mission" to configure payload size, weight, and priority. The Contract-Net protocol will automatically calculate peer utility and award the contract to the best AMR!
              </div>
            </div>
          ) : (
            filtered.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onComplete={completeTask}
                onEdit={openEditModal}
                onDelete={deleteTask}
                canEdit={canEdit}
              />
            ))
          )}
        </div>

        {/* Live Contract Net Auction & P2P Stream */}
        <div className="auction-feed-panel">
          <div className="auction-feed-title">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Cpu className="w-3.5 h-3.5" style={{ color: "var(--solar-terracotta)" }} />
              <span>Contract-Net Auction & Peer Bids</span>
            </span>
            <span className="auction-feed-count">{p2pMessages.length} P2P packets</span>
          </div>

          {/* Live P2P Transmission Feed */}
          <div className="auction-feed-list">
            {p2pMessages.length > 0 ? (
              p2pMessages.map((pkt) => (
                <div
                  key={pkt.id}
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid var(--border-subtle)",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    marginBottom: 6,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: 2 }}>
                    <span style={{ fontWeight: 800, color: robotColor(pkt.sender) }}>
                      {pkt.sender} ➔ {pkt.recipient}
                    </span>
                    <span>{pkt.timestamp}</span>
                  </div>
                  <div style={{ color: "var(--text-primary)", fontWeight: 600, wordBreak: "break-all" }}>
                    [{pkt.type}] {pkt.payload}
                  </div>
                </div>
              ))
            ) : (
              auctionEvents.map((ev, i) => (
                <div key={i} className="auction-event">
                  <span className="auction-time">{ev.time}</span>
                  <span className="auction-type">{ev.type}</span>
                  <span className="auction-msg">{ev.message}</span>
                </div>
              ))
            )}
          </div>

          {/* CNP Protocol Scoring Formulation Box */}
          <div className="auction-protocol-box">
            <div className="auction-proto-title">Contract-Net Protocol (CNP) Formulation</div>
            <div className="auction-proto-row">
              <span>Utility Function</span>
              <code>Bid = (Cap - Payload)×0.05 + Bat×0.40 - Dist(A*)×0.08 + Pri×0.25</code>
            </div>
            <div className="auction-proto-row">
              <span>Capacity Guard</span>
              <span>Disqualifies AMRs where task payload &gt; robot max payload</span>
            </div>
            <div className="auction-proto-row">
              <span>Dynamic Reroute</span>
              <span>A* replans every affected route upon a blockage</span>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE TASK MODAL (Payload size, weight, urgency, priority) */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-box" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 800 }}>Create New Warehouse Mission</span>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleCreateSubmit}>
              {/* Pickup & Destination */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>Pickup Location</label>
                  <select
                    className="form-input"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    required
                  >
                    {availableLocations.map((loc) => (
                      <option key={`p-${loc}`} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Dropoff Destination</label>
                  <select
                    className="form-input"
                    value={dest}
                    onChange={(e) => setDest(e.target.value)}
                  >
                    {availableLocations.map((loc) => (
                      <option key={`d-${loc}`} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payload Size Selector */}
              <div className="form-group">
                <label>Payload Size Class</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {(Object.keys(PAYLOAD_SIZE_METRICS) as PayloadSize[]).map((sz) => {
                    const item = PAYLOAD_SIZE_METRICS[sz];
                    const isSel = payloadSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setPayloadSize(sz);
                          setPayloadKg(item.defaultWeight);
                        }}
                        style={{
                          padding: "10px 6px",
                          borderRadius: 6,
                          border: isSel ? "1.5px solid var(--solar-terracotta)" : "1px solid var(--border-subtle)",
                          backgroundColor: isSel ? "var(--status-active-tint)" : "var(--bg-surface)",
                          color: "var(--text-primary)",
                          textAlign: "center",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6, color: isSel ? "var(--solar-terracotta)" : "var(--text-secondary)" }}>
                          {item.icon}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700 }}>{sz.toUpperCase()}</div>
                        <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>~{item.defaultWeight}kg</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payload Weight Slider */}
              <div className="form-group">
                <label>
                  Payload Weight: <strong style={{ color: "var(--solar-terracotta)" }}>{payloadKg} kg</strong> (Max: {PAYLOAD_SIZE_METRICS[payloadSize].maxWeight} kg)
                </label>
                <input
                  className="form-range"
                  type="range"
                  min={10}
                  max={PAYLOAD_SIZE_METRICS[payloadSize].maxWeight}
                  step={5}
                  value={payloadKg}
                  onChange={(e) => setPayloadKg(Number(e.target.value))}
                />
              </div>

              {/* Urgency & Priority */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>Urgency Level</label>
                  <select
                    className="form-input"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  >
                    <option value="low">Low (Background transit)</option>
                    <option value="standard">Standard (Regular dispatch)</option>
                    <option value="critical">Critical (Priority Mutex override)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority: <strong style={{ color: "var(--solar-terracotta)" }}>{priority}</strong></label>
                  <input
                    className="form-range"
                    type="range"
                    min={1}
                    max={100}
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: 16 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Publishing Task…" : "Submit Task to Contract-Net Auction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL (Attribute & Size management) */}
      {editingTask && (
        <div className="modal-overlay" onClick={() => setEditingTask(null)}>
          <div className="modal-box" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 800 }}>Manage Task Attributes: {editingTask.id}</span>
              <button className="modal-close" onClick={() => setEditingTask(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Route</label>
                <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", padding: "6px 10px", backgroundColor: "var(--bg-elevated)", borderRadius: 4 }}>
                  {editingTask.pickup} ➔ {editingTask.destination}
                </div>
              </div>

              {/* Payload Size Class */}
              <div className="form-group">
                <label>Modify Payload Size Class</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {(Object.keys(PAYLOAD_SIZE_METRICS) as PayloadSize[]).map((sz) => {
                    const item = PAYLOAD_SIZE_METRICS[sz];
                    const isSel = editPayloadSize === sz;
                    return (
                      <button
                        key={`edit-${sz}`}
                        type="button"
                        onClick={() => {
                          setEditPayloadSize(sz);
                          setEditPayloadKg(item.defaultWeight);
                        }}
                        style={{
                          padding: "10px 6px",
                          borderRadius: 6,
                          border: isSel ? "1.5px solid var(--solar-terracotta)" : "1px solid var(--border-subtle)",
                          backgroundColor: isSel ? "var(--status-active-tint)" : "var(--bg-surface)",
                          color: "var(--text-primary)",
                          textAlign: "center",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6, color: isSel ? "var(--solar-terracotta)" : "var(--text-secondary)" }}>
                          {item.icon}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700 }}>{sz.toUpperCase()}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payload Weight */}
              <div className="form-group">
                <label>Payload Weight: <strong style={{ color: "#06B6D4" }}>{editPayloadKg} kg</strong></label>
                <input
                  className="form-range"
                  type="range"
                  min={10}
                  max={PAYLOAD_SIZE_METRICS[editPayloadSize].maxWeight}
                  step={5}
                  value={editPayloadKg}
                  onChange={(e) => setEditPayloadKg(Number(e.target.value))}
                />
              </div>

              {/* Priority & Urgency */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>Priority: <strong style={{ color: "#06B6D4" }}>{editPriority}</strong></label>
                  <input
                    className="form-range"
                    type="range"
                    min={1}
                    max={100}
                    value={editPriority}
                    onChange={(e) => setEditPriority(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Urgency Level</label>
                  <select
                    className="form-input"
                    value={editUrgency}
                    onChange={(e) => setEditUrgency(e.target.value as UrgencyLevel)}
                  >
                    <option value="low">Low</option>
                    <option value="standard">Standard</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Manual Override Assignment */}
              <div className="form-group">
                <label>AMR Assignment Override</label>
                <select
                  className="form-input"
                  value={editAssignedRobot}
                  onChange={(e) => setEditAssignedRobot(e.target.value as RobotId | "auto")}
                >
                  <option value="auto">Auto (Contract-Net Protocol Auction)</option>
                  {robots.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id} ({r.name} · {r.payload_capacity_kg ?? "?"}kg Max)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions" style={{ marginTop: 16 }}>
                <button type="button" className="btn-ghost" onClick={() => setEditingTask(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving…" : "Save Attributes & Re-Auction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
