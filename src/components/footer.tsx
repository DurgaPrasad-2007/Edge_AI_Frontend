import Link from "next/link";
import { ShieldCheck, Cpu, Terminal, ExternalLink } from "lucide-react";
import { EdgeAiLogo } from "@/components/brand/edge-ai-logo";

export function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-container">
        {/* Column 1: Brand & Purpose */}
        <div>
          <div style={{ marginBottom: 12 }}>
            <EdgeAiLogo size={28} />
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 380 }}>
            Decentralized peer-to-peer fleet coordination for autonomous mobile robots (AMRs) in high-density smart
            industrial warehouses. Eliminates single-point-of-failure dispatchers with sub-84ms local consensus.
          </p>
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ISO 3691-4:2023 Compliant &middot; SIL-2 Zero-Motion API Observer</span>
          </div>
        </div>

        {/* Column 2: System & Architecture */}
        <div>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 14 }}>
            Architecture
          </h3>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <li>
              <a href="/#architecture" style={{ color: "var(--text-secondary)", transition: "color 0.15s" }}>
                Contract-Net Utility Auction
              </a>
            </li>
            <li>
              <a href="/#architecture" style={{ color: "var(--text-secondary)", transition: "color 0.15s" }}>
                Corridor C-14 Space-Time Leases
              </a>
            </li>
            <li>
              <a href="/#simulator" style={{ color: "var(--text-secondary)", transition: "color 0.15s" }}>
                Dynamic Obstacle Detour Engine
              </a>
            </li>
            <li>
              <a href="/#specs" style={{ color: "var(--text-secondary)", transition: "color 0.15s" }}>
                Onboard SWaP-C Hardware Spec
              </a>
            </li>
            <li>
              <Link href="/console" style={{ color: "var(--status-active)", fontWeight: 600 }}>
                Operator Dispatch Terminal &rarr;
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Documentation & Verification */}
        <div>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 14 }}>
            Documentation &amp; Review
          </h3>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <li>
              <Link href="/docs" style={{ color: "var(--text-secondary)" }}>
                Technical Documentation
              </Link>
            </li>
            <li>
              <a href="/#compliance" style={{ color: "var(--text-secondary)" }}>
                SIH 26123 Compliance Matrix
              </a>
            </li>
            <li>
              <a href="/#benchmarks" style={{ color: "var(--text-secondary)" }}>
                Empirical Benchmark Data
              </a>
            </li>
            <li>
              <Link href="/docs#hardware" style={{ color: "var(--text-secondary)" }}>
                Raspberry Pi 5 / Jetson Validation
              </Link>
            </li>
            <li>
              <Link href="/security" style={{ color: "var(--text-secondary)" }}>
                Zero-Motion Safety Guarantee
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Legal & Standards */}
        <div>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 14 }}>
            Trust &amp; Governance
          </h3>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <li>
              <Link href="/privacy" style={{ color: "var(--text-secondary)" }}>
                Privacy Policy (India DPDP &amp; GDPR)
              </Link>
            </li>
            <li>
              <Link href="/terms" style={{ color: "var(--text-secondary)" }}>
                Terms &amp; Evaluation License
              </Link>
            </li>
            <li>
              <Link href="/security" style={{ color: "var(--text-secondary)" }}>
                Cybersecurity &amp; IEC 62443
              </Link>
            </li>
            <li>
              <a href="https://sih.gov.in" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)" }}>
                SIH 2026 Portal <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="footer-bottom">
        <div>
          &copy; {new Date().getFullYear()} EdgeFleet Autonomous Systems &middot; Smart India Hackathon 2026 Problem Statement 26123.
        </div>
        <div className="font-mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
          Evaluated for Bharat Electronics Limited (BEL) &middot; ISO 3691-4:2023 Safety Envelope Enforced
        </div>
      </div>
    </footer>
  );
}
