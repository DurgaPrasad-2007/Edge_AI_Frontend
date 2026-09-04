"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, DEFAULT_ADMIN_CREDENTIALS } from "@/components/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/console");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      router.push("/console");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = () => {
    setEmail(DEFAULT_ADMIN_CREDENTIALS.email);
    setPassword(DEFAULT_ADMIN_CREDENTIALS.password);
    setErrorMsg("");
  };

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#060911" }}>
        <div style={{ fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", fontSize: "13px", letterSpacing: "0.08em" }}>
          VERIFYING SESSION CREDENTIALS...
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        background: "radial-gradient(ellipse at 50% 25%, #0e1a33 0%, #060911 75%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "36px 32px",
          background: "linear-gradient(180deg, rgba(16, 24, 45, 0.95) 0%, rgba(11, 17, 32, 0.98) 100%)",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          borderRadius: "8px",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6), 0 0 1px rgba(56, 189, 248, 0.3)",
          backdropFilter: "blur(16px)",
          position: "relative",
        }}
      >
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "6px",
              background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
              color: "#060911",
              fontWeight: "900",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              boxShadow: "0 4px 14px rgba(56, 189, 248, 0.3)",
            }}
          >
            EF
          </div>
          <div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#F8FAFC",
                fontFamily: "var(--font-sans)",
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              EDGEFLEET MISSION CONTROL
            </h1>
            <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#10B981", marginTop: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
              OPERATOR ACCESS GATEWAY · ISO 3691-4
            </div>
          </div>
        </div>

        <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "22px" }}>
          Authenticate operator identity to access real-time AMR corridor leases, space-time conflict arbitration, and decentralized task dispatch.
        </p>

        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              borderRadius: "4px",
              color: "#FCA5A5",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              marginBottom: "18px",
            }}
          >
            <b>SECURITY ERROR:</b> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#94A3B8", fontFamily: "var(--font-mono)", marginBottom: "6px" }}>
              OPERATOR IDENTITY (EMAIL)
            </label>
            <input
              type="email"
              required
              value={email}
              placeholder="e.g. admin@edgefleet.local"
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "13.5px",
                color: "#F8FAFC",
                background: "rgba(6, 9, 17, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "4px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#38BDF8")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.12)")}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#94A3B8", fontFamily: "var(--font-mono)", marginBottom: "6px" }}>
              SECURITY KEY / PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "13.5px",
                color: "#F8FAFC",
                background: "rgba(6, 9, 17, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "4px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#38BDF8")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.12)")}
            />
          </div>

          <div style={{ marginTop: "6px" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "12.5px",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.04em",
                fontWeight: "700",
                color: "#060911",
                background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
                border: "none",
                borderRadius: "4px",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(56, 189, 248, 0.3)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              {submitting ? "VERIFYING CREDENTIALS..." : "AUTHENTICATE & ENTER CONSOLE"}
            </button>
          </div>
        </form>

        {/* Quick Helper Button */}
        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              EVALUATION ACCESS:
            </span>
            <button
              type="button"
              onClick={handleQuickFill}
              style={{
                background: "rgba(56, 189, 248, 0.08)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                color: "#38BDF8",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                padding: "4px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(56, 189, 248, 0.18)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(56, 189, 248, 0.08)")}
            >
              Quick-Fill Default Admin
            </button>
          </div>
        </div>

        <div style={{ marginTop: "22px", textAlign: "center" }}>
          <Link
            href="/"
            style={{
              color: "var(--text-secondary)",
              fontSize: "12px",
              textDecoration: "none",
              fontFamily: "var(--font-mono)",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F8FAFC")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            &larr; Return to Enterprise Overview
          </Link>
        </div>
      </div>
    </main>
  );
}
