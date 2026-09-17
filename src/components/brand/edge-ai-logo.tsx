"use client";

import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  variant?: "full" | "compact" | "mark";
}

/**
 * Edge AI Official Brand Identity
 * Represents 3 decentralized AMR edge nodes converging at a synchronized consensus core.
 * Original geometric architecture — 0 external copyright infringement.
 */
export function EdgeAiMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Edge AI Emblem"
    >
      <defs>
        {/* Gradients for kinetic depth */}
        <linearGradient id="edgeNode1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="edgeAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="edgeSafety" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Hexagonal Outer Frame — Isometric Engineering Perspective */}
      <polygon
        points="18,2 33,10.5 33,25.5 18,34 3,25.5 3,10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.25"
        fill="none"
      />

      {/* Node 1: Top-Left Peer AMR Link */}
      <path
        d="M18 4L31 11.5L25 15L18 11L11 15L5 11.5L18 4Z"
        fill="url(#edgeAccent)"
      />

      {/* Node 2: Bottom-Right Peer AMR Link */}
      <path
        d="M31 13.5V24.5L19 31.5V24.5L25 21L31 13.5Z"
        fill="#334155"
      />

      {/* Node 3: Bottom-Left Peer AMR Link */}
      <path
        d="M5 13.5L11 21L17 24.5V31.5L5 24.5V13.5Z"
        fill="#475569"
      />

      {/* Central Autonomous Mutex Consensus Core */}
      <circle cx="18" cy="18" r="3.2" fill="#10B981" />
      <circle cx="18" cy="18" r="5.5" stroke="#10B981" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="2 2" />
    </svg>
  );
}

export function EdgeAiLogo({
  size = 32,
  className = "",
  showWordmark = true,
  variant = "full",
}: LogoProps) {
  return (
    <div
      className={`edge-ai-brand ${className}`}
      style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}
    >
      <div
        style={{
          display: "grid",
          placeItems: "center",
          width: size,
          height: size,
          flexShrink: 0,
        }}
      >
        <EdgeAiMark size={size} />
      </div>

      {showWordmark && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: size >= 36 ? 18 : 15,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              EDGE AI
            </span>
            <span
              className="mono-tag"
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 5px",
                borderRadius: 4,
                letterSpacing: "0.04em",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              SIH 26123
            </span>
          </div>

          {variant === "full" && (
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 600,
                letterSpacing: "0.05em",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                marginTop: 2,
              }}
            >
              DISTRIBUTED FLEET COORDINATION
            </span>
          )}
        </div>
      )}
    </div>
  );
}
