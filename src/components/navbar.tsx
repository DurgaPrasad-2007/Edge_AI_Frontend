"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { EdgeAiLogo } from "@/components/brand/edge-ai-logo";
import { playClick } from "@/lib/sound-effects";

interface NavbarProps {
  apiStatus?: "online" | "offline" | "connecting";
  onOpenUserModal?: () => void;
  onOpenCmdPalette?: () => void;
}

export function Navbar({ onOpenUserModal, onOpenCmdPalette }: NavbarProps) {
  const auth = useAuth();

  return (
    <header className="site-navbar" role="banner">
      <div className="navbar-container">
        {/* Brand & Breadcrumb Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            href="/"
            className="nav-brand"
            aria-label="Edge AI Home"
            onClick={() => playClick()}
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}
          >
            <EdgeAiLogo size={28} />
          </Link>
        </div>

        {/* Streamlined Typography Links (21st.dev Architecture) */}
        <nav aria-label="Main Navigation" className="nav-navigation">
          <ul className="nav-menu">
            <li>
              <a href="/#architecture" className="nav-link" onClick={() => playClick()}>
                Systems
              </a>
            </li>
            <li>
              <a href="/#simulator" className="nav-link" onClick={() => playClick()}>
                Floor Twin
              </a>
            </li>
            <li>
              <a href="/#protocol-flow" className="nav-link" onClick={() => playClick()}>
                Consensus Loop
              </a>
            </li>
            <li>
              <a href="/#compliance" className="nav-link" onClick={() => playClick()}>
                Safety Matrix
              </a>
            </li>
            <li>
              <a href="/#benchmarks" className="nav-link" onClick={() => playClick()}>
                Benchmarks
              </a>
            </li>
            <li>
              <Link href="/docs" className="nav-link" onClick={() => playClick()}>
                Docs
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right Actions: Command Trigger, Mesh Status, Theme, and Console CTA */}
        <div className="nav-actions">
          {/* Quick Command Trigger (21st.dev Style) */}
          {onOpenCmdPalette && (
            <button
              type="button"
              onClick={() => {
                playClick();
                onOpenCmdPalette();
              }}
              aria-label="Open command palette"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-elevated)",
                color: "var(--text-muted)",
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-tactical)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline" style={{ fontSize: 11.5 }}>Search</span>
              <kbd
                style={{
                  fontSize: 9.5,
                  fontFamily: "var(--font-mono)",
                  padding: "1px 5px",
                  borderRadius: 3,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
              >
                ⌘K
              </kbd>
            </button>
          )}

          {/* Peer Mesh Status Pill */}
          <div
            className="hidden lg:flex items-center gap-2"
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 6,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
            }}
            title="3-AMR peer mesh operational with zero central cloud dependency"
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--solar-terracotta)", boxShadow: "0 0 6px rgba(194, 84, 26, 0.4)" }} />
            <span>3/3 Peers</span>
          </div>

          {/* Theme Toggle (Tactile Sun/Moon) */}
          <ThemeToggle />

          {/* Auth State & Console CTA */}
          {auth.user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--bg-elevated)",
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "1px solid var(--border-subtle)",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                }}
              >
                <span>{auth.user.email}</span>
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    padding: "1px 5px",
                    borderRadius: 3,
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                  }}
                >
                  {auth.user.roles[0]?.toUpperCase()}
                </span>
              </div>
              {auth.user.roles.includes("admin") && onOpenUserModal && (
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    onOpenUserModal();
                  }}
                  className="btn btn-secondary"
                  style={{ padding: "6px 12px", fontSize: 12 }}
                >
                  Users
                </button>
              )}
              <Link
                href="/console"
                className="btn btn-primary"
                style={{ padding: "6px 14px", fontSize: 12 }}
                onClick={() => playClick()}
              >
                Console &rarr;
              </Link>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  auth.signOut();
                }}
                className="btn btn-secondary"
                style={{ padding: "6px 12px", fontSize: 12 }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link
                href="/login"
                className="nav-link"
                style={{ fontSize: 13, fontWeight: 500, padding: "6px 8px" }}
                onClick={() => playClick()}
              >
                Sign In
              </Link>
              <Link
                href="/console"
                className="btn btn-primary"
                id="btn-operator-console-header"
                style={{ padding: "7px 16px", fontSize: 12.5 }}
                onClick={() => playClick()}
              >
                Operator Console &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
