"use client";

/**
 * ConsoleLayout — Premium Fleet Management Console Shell
 *
 * Layout: Fixed sidebar (56px collapsed / 220px hovered) + top KPI bar + main content.
 * Inspired by MiR Fleet Enterprise, LocusOne LocusHub, NASA mission control aesthetics.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useFleetSocket, type KPIMetrics, type ConnectionMode } from "@/lib/use-fleet-socket";
import { playClick } from "@/lib/sound-effects";

// ── Icons (inline SVG for zero-dep) ──────────────────────────────────────

const IconControl = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);
const IconFleet = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><line x1="12" y1="7" x2="12" y2="11" />
    <line x1="8" y1="16" x2="8" y2="16" strokeWidth="2.5" /><line x1="16" y1="16" x2="16" y2="16" strokeWidth="2.5" />
  </svg>
);
const IconComms = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
  </svg>
);
const IconAnalytics = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconWifi = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill="currentColor" />
  </svg>
);
const IconWifiOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" /><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" /><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" /><path d="M10.71 5.05A16 16 0 0 1 22.56 9" /><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill="currentColor" />
  </svg>
);

// ── Streamlined Nav items (Compressed to 4 cohesive hubs) ────────────────────

const NAV_ITEMS = [
  { href: "/console", label: "Mission Control", icon: IconControl, matches: ["/console", "/console/map"] },
  { href: "/console/workers", label: "Fleet & Tasks", icon: IconFleet, matches: ["/console/workers", "/console/jobs"] },
  { href: "/console/telemetry", label: "Network & Comms", icon: IconComms, matches: ["/console/telemetry", "/console/comms"] },
  { href: "/console/settings", label: "Settings & Audit", icon: IconSettings, matches: ["/console/settings", "/console/audit", "/console/analytics"] },
];

// ── KPI Ticker ────────────────────────────────────────────────────────────

function KPITicker({ kpis, mode, robots }: { kpis: KPIMetrics; mode: ConnectionMode; robots: Array<{ status: string; battery: number; id: string }> }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const activeRobots = robots.filter((r) => r.status === "Moving" || r.status === "Task handoff" || r.status === "Rerouting").length;

  return (
    <div className="console-kpi-bar">
      <div className="kpi-bar-brand">
        <span className="kpi-brand-text">EDGEFLEET</span>
        <span className="kpi-brand-sub">SIH-26123</span>
      </div>

      <div className="kpi-metrics-row">
        <KPIChip label="FLEET UTIL" value={`${kpis.fleetUtilizationPct}%`} color="cyan" pulse={kpis.fleetUtilizationPct > 50} />
        <KPIChip label="ACTIVE AMRs" value={`${activeRobots}/${robots.length}`} color="green" />
        <KPIChip label="AVG BATTERY" value={`${kpis.avgBatteryPct}%`} color={kpis.avgBatteryPct < 30 ? "amber" : "green"} />
        <KPIChip label="TASKS/HR" value={`${kpis.tasksPerHour}`} color="cyan" />
        <KPIChip label="COMPLETED" value={`${kpis.completedTotal}`} color="green" />
        <KPIChip label="COLLISIONS" value={`${kpis.collisionCount}`} color={kpis.collisionCount > 0 ? "red" : "green"} />
        <KPIChip label="C-14 LEASES" value={`${kpis.activeLeases}`} color="amber" />
        <KPIChip label="MESH HEALTH" value={`${kpis.meshHealthPct}%`} color={kpis.meshHealthPct > 80 ? "green" : "amber"} />
        <KPIChip label="TICK" value={`${kpis.tick}`} color="default" mono />
      </div>

      <div className="kpi-bar-status">
        <ThemeToggle className="console-theme-toggle" />
        <Link href="/" className="console-home-btn" title="Back to Flagship Experience">
          <span>Home</span>
        </Link>
        <div className={`kpi-conn-badge kpi-conn-${mode}`}>
          {mode === "live" ? <IconWifi /> : <IconWifiOff />}
          <span>{mode === "live" ? "LIVE" : "OFFLINE SIM"}</span>
        </div>
        <ClientClock />
      </div>
    </div>
  );
}

function ClientClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return <span className="kpi-clock" suppressHydrationWarning>{time || "--:--:--"}</span>;
}

function KPIChip({ label, value, color, pulse, mono }: { label: string; value: string; color: string; pulse?: boolean; mono?: boolean }) {
  return (
    <div className={`kpi-chip kpi-chip-${color}`}>
      <span className="kpi-chip-label">{label}</span>
      <span className={`kpi-chip-value${mono ? " kpi-chip-mono" : ""}${pulse ? " kpi-pulse" : ""}`}>{value}</span>
    </div>
  );
}

// ── Main ConsoleLayout ─────────────────────────────────────────────────────

export function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, session, signOut } = useAuth();
  const { kpis, robots, connectionMode } = useFleetSocket(session?.access_token);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="console-shell" onMouseLeave={() => setSidebarOpen(false)}>
      {/* ── Top KPI Bar ── */}
      <KPITicker kpis={kpis} mode={connectionMode} robots={robots} />

      <div className="console-body">
        {/* ── Sidebar ── */}
        <nav
          className={`console-sidebar${sidebarOpen ? " console-sidebar-open" : ""}`}
          onMouseEnter={() => setSidebarOpen(true)}
        >
          {/* Nav Items */}
          <div className="sidebar-nav-list">
            {NAV_ITEMS.map(({ href, label, icon: Icon, matches }) => {
              const active = matches.some((m) => m === "/console" ? pathname === "/console" : pathname.startsWith(m));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => playClick()}
                  className={`sidebar-nav-item${active ? " sidebar-nav-item-active" : ""}`}
                >
                  <span className="sidebar-nav-icon"><Icon /></span>
                  <span className="sidebar-nav-label">{label}</span>
                  {active && <span className="sidebar-active-bar" />}
                </Link>
              );
            })}
          </div>

          {/* User section */}
          <div className="sidebar-footer">
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                {user?.email?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="sidebar-user-details">
                <span className="sidebar-user-email">{user?.email ?? "offline"}</span>
                <span className="sidebar-user-role">{user?.roles?.[0] ?? "viewer"}</span>
              </div>
            </div>
            <button className="sidebar-logout-btn" onClick={signOut} title="Sign Out">
              <IconLogout />
            </button>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main className="console-main" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
