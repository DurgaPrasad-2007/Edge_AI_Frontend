"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Check, X } from "lucide-react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("edgefleet_telemetry_consent");
    if (!consent) {
      // Show consent drawer after initial render
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("edgefleet_telemetry_consent", "all");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("edgefleet_telemetry_consent", "essential_only");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="Privacy & Telemetry Consent"
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        right: 20,
        maxWidth: 580,
        margin: "0 auto",
        zIndex: 100,
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-tactical)",
        borderRadius: 8,
        padding: "16px 20px",
        boxShadow: "var(--shadow-elevated)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            padding: 6,
            borderRadius: 6,
            backgroundColor: "var(--status-active-tint)",
            color: "var(--status-active)",
          }}
        >
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            Industrial Telemetry &amp; Privacy Notice
          </h4>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            EdgeFleet stores local simulation cache and operational session tokens under the India Digital Personal
            Data Protection (DPDP) Act 2023/2026 and EU GDPR. Peer-to-peer AMR packets are processed strictly on local
            operational networks.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, borderTop: "1px solid var(--border-subtle)", paddingTop: 10 }}>
        <Link href="/privacy" style={{ fontSize: 11, color: "var(--status-active)", fontWeight: 600 }}>
          View Data Protection Policy &rarr;
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={handleDecline}
            className="btn btn-secondary"
            style={{ padding: "5px 12px", fontSize: 11 }}
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="btn btn-primary"
            style={{ padding: "5px 14px", fontSize: 11 }}
          >
            Acknowledge &amp; Accept
          </button>
        </div>
      </div>
    </div>
  );
}
