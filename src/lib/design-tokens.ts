export type ThemeMode = "light" | "dark";

export interface ColorTokens {
  bgBase: string;
  bgSurface: string;
  bgElevated: string;
  bgMuted: string;
  borderSubtle: string;
  borderTactical: string;
  borderFocus: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  statusNominal: string;
  statusNominalTint: string;
  statusWarning: string;
  statusWarningTint: string;
  statusActive: string;
  statusActiveTint: string;
  statusDanger: string;
  statusDangerTint: string;
}

export const LIGHT_THEME: ColorTokens = {
  bgBase: "#F8FAFC",
  bgSurface: "#FFFFFF",
  bgElevated: "#F1F5F9",
  bgMuted: "#E2E8F0",
  borderSubtle: "#E2E8F0",
  borderTactical: "#CBD5E1",
  borderFocus: "#0284C7",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#64748B",
  statusNominal: "#059669",
  statusNominalTint: "#ECFDF5",
  statusWarning: "#D97706",
  statusWarningTint: "#FFFBEB",
  statusActive: "#2563EB",
  statusActiveTint: "#EFF6FF",
  statusDanger: "#DC2626",
  statusDangerTint: "#FEF2F2",
};

export const DARK_THEME: ColorTokens = {
  bgBase: "#0B0F19",
  bgSurface: "#111827",
  bgElevated: "#1F2937",
  bgMuted: "#374151",
  borderSubtle: "rgba(255, 255, 255, 0.08)",
  borderTactical: "rgba(56, 189, 248, 0.20)",
  borderFocus: "#38BDF8",
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",
  statusNominal: "#10B981",
  statusNominalTint: "rgba(16, 185, 129, 0.15)",
  statusWarning: "#F59E0B",
  statusWarningTint: "rgba(245, 158, 11, 0.15)",
  statusActive: "#38BDF8",
  statusActiveTint: "rgba(56, 189, 248, 0.15)",
  statusDanger: "#EF4444",
  statusDangerTint: "rgba(239, 68, 68, 0.15)",
};

export const SYSTEM_META = {
  problemStatement: "SIH-26123",
  title: "EdgeFleet: Distributed Edge-AI Fleet Coordination",
  organization: "Smart India Hackathon 2026 / Bharat Electronics Limited (BEL) Benchmark",
  standardCompliance: ["ISO 3691-4:2023 (AMR Safety)", "IEC 62443-4-2 (Security)", "SIL-2 Zero-Motion Observer"],
};
