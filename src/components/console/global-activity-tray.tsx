"use client";

/**
 * GlobalActivityTray — Persistent mission awareness strip
 *
 * Always rendered inside ConsoleLayout, visible on EVERY console page.
 * Shows: simulation running/paused state, live task assignments, last events, task toasts.
 * Solves the "I don't know what's happening after leaving the Fleet page" problem.
 */

import { useState, useEffect, useRef } from "react";
import { useFleetSocket, type TaskRecord, type FleetEvent } from "@/lib/use-fleet-socket";
import {
  Play,
  Pause,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";

// ── Task Assignment Toast ─────────────────────────────────────────────────

interface Toast {
  id: string;
  task: TaskRecord;
  robotColor: string;
  ts: number;
}

function TaskToast({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 20);
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }, 6000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDismiss]);

  return (
    <div
      className={`activity-toast${visible ? " activity-toast-visible" : ""}`}
      style={{ "--toast-color": toast.robotColor } as React.CSSProperties}
    >
      <div className="toast-icon">
        <Zap className="w-3.5 h-3.5" style={{ color: toast.robotColor }} />
      </div>
      <div className="toast-body">
        <span className="toast-title">Task Assigned</span>
        <span className="toast-detail">
          <span className="toast-task-id">{toast.task.id}</span>
          <ArrowRight className="w-3 h-3 opacity-50" />
          <span style={{ color: toast.robotColor, fontWeight: 700 }}>{toast.task.assigned_robot_id}</span>
          <span className="toast-arrow"> → </span>
          <span className="toast-dest">{toast.task.destination}</span>
        </span>
      </div>
      <button
        className="toast-close"
        onClick={() => {
          setVisible(false);
          setTimeout(onDismiss, 400);
        }}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── Task Pill ─────────────────────────────────────────────────────────────

const STATUS_DOT: Record<string, string> = {
  Queued: "#64748B",
  Assigned: "#06B6D4",
  "In Progress": "#F59E0B",
  Blocked: "#EF4444",
};

function TaskPill({ task, robotColor }: { task: TaskRecord; robotColor: string }) {
  const dotColor = STATUS_DOT[task.status] ?? "#64748B";
  const isActive = task.status === "In Progress" || task.status === "Assigned";

  return (
    <div
      className={`tray-task-pill${isActive ? " tray-pill-active" : ""}`}
      style={{ "--pill-color": robotColor } as React.CSSProperties}
      title={`${task.id}: ${task.pickup} → ${task.destination} (${task.status})`}
    >
      <span
        className="tray-pill-dot"
        style={{ background: dotColor, boxShadow: isActive ? `0 0 6px ${dotColor}` : "none" }}
      />
      <span className="tray-pill-id">{task.id}</span>
      {task.assigned_robot_id && (
        <>
          <ArrowRight className="w-2.5 h-2.5 opacity-40" />
          <span className="tray-pill-robot" style={{ color: robotColor }}>
            {task.assigned_robot_id}
          </span>
        </>
      )}
      <span className="tray-pill-dest">→ {task.destination}</span>
      <span className="tray-pill-status" style={{ color: dotColor }}>
        {task.status}
      </span>
    </div>
  );
}

// ── Event Row ─────────────────────────────────────────────────────────────

const EVENT_COLOR: Record<string, string> = {
  LEASE: "#06B6D4",
  INTENT: "#A855F7",
  REROUTE: "#F59E0B",
  HANDOFF: "#10B981",
  HEARTBEAT: "#475569",
};

function EventRow({ ev }: { ev: FleetEvent }) {
  const color = EVENT_COLOR[ev.type] ?? "#64748B";
  return (
    <div className="tray-event-row">
      <span className="tray-event-time">{ev.time}</span>
      <span className="tray-event-type" style={{ color }}>
        {ev.type}
      </span>
      <span className="tray-event-msg">{ev.message}</span>
    </div>
  );
}

// ── Main GlobalActivityTray ────────────────────────────────────────────────

export function GlobalActivityTray() {
  const { fleetState, tasks, events, robotColor } = useFleetSocket();
  const [expanded, setExpanded] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const prevTasksRef = useRef<Map<string, string>>(new Map());

  const running = fleetState?.running ?? false;
  const tick = fleetState?.tick ?? 0;
  const activeTasks = tasks.filter((t) => t.status !== "Completed");
  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const recentEvents = events.slice(0, 4);

  // Detect new task assignments → toast
  useEffect(() => {
    const prevMap = prevTasksRef.current;
    for (const task of tasks) {
      const prevStatus = prevMap.get(task.id);
      if (prevStatus && prevStatus !== "Assigned" && task.status === "Assigned" && task.assigned_robot_id) {
        const color = robotColor(task.assigned_robot_id);
        setToasts((prev) => [
          ...prev.slice(-3),
          { id: `${task.id}-${Date.now()}`, task, robotColor: color, ts: Date.now() },
        ]);
      }
      prevMap.set(task.id, task.status);
    }
  }, [tasks, robotColor]);

  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const hasActivity = activeTasks.length > 0 || running;

  return (
    <>
      {/* Toast Container — top-right corner, always visible */}
      <div className="activity-toast-container">
        {toasts.map((t) => (
          <TaskToast key={t.id} toast={t} onDismiss={() => dismissToast(t.id)} />
        ))}
      </div>

      {/* Simulation Status Stripe — top of page animated line */}
      <div className={`sim-status-stripe${running ? " sim-stripe-running" : " sim-stripe-paused"}`} />

      {/* Activity Tray */}
      <div className={`global-activity-tray${hasActivity ? " tray-has-activity" : ""}`}>
        {/* Header row — always visible, click to toggle */}
        <div className="tray-header" onClick={() => setExpanded((e) => !e)}>
          <div className="tray-header-left">
            <div className={`tray-sim-badge${running ? " tray-sim-running" : " tray-sim-paused"}`}>
              {running ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
              <span>{running ? "SIM RUNNING" : "SIM PAUSED"}</span>
              {running && <span className="tray-tick">#{tick}</span>}
            </div>

            {activeTasks.length > 0 && (
              <div className="tray-count-chip">
                <Clock className="w-3 h-3" />
                <span>{activeTasks.length} active</span>
              </div>
            )}

            {completedCount > 0 && (
              <div className="tray-count-chip tray-chip-done">
                <CheckCircle2 className="w-3 h-3" />
                <span>{completedCount} done</span>
              </div>
            )}

            {fleetState?.aisle_blocked && (
              <div className="tray-warn-chip">
                <AlertTriangle className="w-3 h-3" />
                <span>AISLE BLOCKED</span>
              </div>
            )}
          </div>

          <div className="tray-header-right">
            <span className="tray-toggle-label">{expanded ? "Hide" : "Show"} Activity</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Expanded body */}
        {expanded && (
          <div className="tray-body">
            <div className="tray-missions-section">
              <span className="tray-section-label">ACTIVE MISSIONS</span>
              {activeTasks.length > 0 ? (
                <div className="tray-pills-list">
                  {activeTasks.map((t) => (
                    <TaskPill key={t.id} task={t} robotColor={robotColor(t.assigned_robot_id)} />
                  ))}
                </div>
              ) : (
                <div className="tray-empty-missions">No active missions — fleet standing by</div>
              )}
            </div>

            {recentEvents.length > 0 && (
              <div className="tray-events-section">
                <span className="tray-section-label">RECENT EVENTS</span>
                <div className="tray-events-list">
                  {recentEvents.map((ev, i) => (
                    <EventRow key={ev.id ?? i} ev={ev} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
