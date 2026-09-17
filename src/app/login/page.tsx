"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, DEMO_CREDENTIALS_LIST } from "@/components/auth-provider";
import { EdgeAiLogo } from "@/components/brand/edge-ai-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { playClick, playChirp, playWarning } from "@/lib/sound-effects";

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
      playChirp();
      router.push("/console");
    } catch (err: unknown) {
      playWarning();
      setErrorMsg(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInstantSignIn = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg("");
    setSubmitting(true);
    try {
      await signIn(demoEmail, demoPass);
      playChirp();
      router.push("/console");
    } catch (err: unknown) {
      playWarning();
      setErrorMsg(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "var(--bg-base)" }}>
        <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "13px", letterSpacing: "0.05em" }}>
          VERIFYING OPERATOR CREDENTIALS...
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "32px 20px",
        backgroundColor: "var(--bg-base)",
        position: "relative",
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 20,
          right: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        <Link
          href="/"
          onClick={() => playClick()}
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          &larr; Return to Edge AI Overview
        </Link>
        <ThemeToggle />
      </div>

      {/* Center Authentication Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "32px 28px",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-tactical)",
          borderRadius: "10px",
          boxShadow: "var(--shadow-elevated)",
          marginTop: 24,
        }}
      >
        {/* Brand & Security Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <Link href="/" onClick={() => playClick()} style={{ textDecoration: "none" }}>
            <EdgeAiLogo size={32} />
          </Link>
          <span
            className="mono-tag"
            style={{
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            IEC 62443 // AUTH GATEWAY
          </span>
        </div>

        <h1
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: 6,
          }}
        >
          Operator Mission Control
        </h1>

        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 22 }}>
          Authenticate to access real-time AMR corridor leases, space-time conflict arbitration, and decentralized task dispatch.
        </p>

        {/* PROMINENT EVALUATOR DEMO CREDENTIALS BOX */}
        <div
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-tactical)",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "22px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                color: "var(--text-primary)",
                letterSpacing: "0.04em",
              }}
            >
              SIH-26123 EVALUATOR DEMO ACCESS
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--status-nominal)",
                fontFamily: "var(--font-mono)",
              }}
            >
              PRE-CONFIGURED
            </span>
          </div>

          <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "0 0 12px 0", lineHeight: 1.4 }}>
            Click below to immediately log in with mock evaluation roles or auto-fill credentials:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DEMO_CREDENTIALS_LIST.map((cred) => (
              <div
                key={cred.email}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "12px",
                  gap: 10,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <strong style={{ color: "var(--text-primary)", fontSize: "12px" }}>{cred.role}</strong>
                    <span className="mono-tag" style={{ fontSize: "9px", padding: "1px 4px" }}>
                      {cred.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {cred.email}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setEmail(cred.email);
                      setPassword(cred.password);
                      setErrorMsg("");
                    }}
                    className="btn btn-secondary"
                    style={{ padding: "4px 8px", fontSize: "11px" }}
                    title="Fill form inputs"
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInstantSignIn(cred.email, cred.password)}
                    className="btn btn-primary"
                    style={{ padding: "4px 10px", fontSize: "11px" }}
                    title="Sign in instantly"
                  >
                    1-Click Sign In
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "var(--status-danger-tint)",
              border: "1px solid var(--status-danger-border)",
              borderRadius: "6px",
              color: "var(--status-danger)",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              marginBottom: "18px",
            }}
          >
            <strong>AUTHENTICATION NOTICE:</strong> {errorMsg}
          </div>
        )}

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
          <div>
            <label
              htmlFor="login-email"
              style={{
                display: "block",
                fontSize: "11.5px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
                marginBottom: "6px",
              }}
            >
              OPERATOR IDENTITY (EMAIL)
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              placeholder="e.g. admin@edgefleet.local"
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "13.5px",
                color: "var(--text-primary)",
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-tactical)",
                borderRadius: "6px",
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              style={{
                display: "block",
                fontSize: "11.5px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
                marginBottom: "6px",
              }}
            >
              SECURITY KEY / PASSWORD
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              placeholder="Enter password or use 1-click above"
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "13.5px",
                color: "var(--text-primary)",
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-tactical)",
                borderRadius: "6px",
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
            />
          </div>

          <div style={{ marginTop: "4px" }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "11px",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              {submitting ? "VERIFYING CREDENTIALS..." : "Authenticate & Enter Console \u2192"}
            </button>
          </div>
        </form>

        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            Zero-Motion API Observer Guarantee &bull; ROS 2 / Zenoh Mesh Bridge
          </span>
        </div>
      </div>
    </main>
  );
}
