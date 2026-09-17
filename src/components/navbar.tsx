"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { EdgeAiLogo } from "@/components/brand/edge-ai-logo";
import { playClick } from "@/lib/sound-effects";

interface NavbarProps {
  apiStatus?: "online" | "offline" | "connecting";
  onOpenUserModal?: () => void;
  onOpenCmdPalette?: () => void;
}

export function Navbar({ onOpenUserModal }: NavbarProps) {
  const auth = useAuth();

  return (
    <header className="site-navbar" role="banner">
      <div className="navbar-container">
        {/* Brand */}
        <Link
          href="/"
          className="nav-brand"
          aria-label="Edge AI Home"
          onClick={() => playClick()}
          style={{ textDecoration: "none" }}
        >
          <EdgeAiLogo size={30} />
        </Link>

        {/* Streamlined Navigation Links (Pure Typography, No Cluttered Icons) */}
        <nav aria-label="Main Navigation" className="nav-navigation">
          <ul className="nav-menu">
            <li>
              <a href="/#bento-architecture" className="nav-link" onClick={() => playClick()}>
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

        {/* Right Actions: Restrained, Focused, High-Affordance */}
        <div className="nav-actions">
          {/* Theme Toggle */}
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
                  border: "1px solid var(--border-tactical)",
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
                    background: "var(--bg-muted)",
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

