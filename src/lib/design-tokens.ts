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
  bgBase: "#FAF8F5", // Solar Dusk Light Canvas
  bgSurface: "#F5F2EC", // Solar Dusk Light Surface
  bgElevated: "#ECE5DA",
  bgMuted: "#EFE9E0",
  borderSubtle: "#E2DACD",
  borderTactical: "#D4C9B8",
  borderFocus: "#C2541A",
  textPrimary: "#38302A",
  textSecondary: "#6E6359",
  textMuted: "#94887C",
  statusNominal: "#16A34A",
  statusNominalTint: "#F0FDF4",
  statusWarning: "#C2541A",
  statusWarningTint: "#FFF7ED",
  statusActive: "#C2541A", // Solar Dusk Terracotta
  statusActiveTint: "#FFEDD5",
  statusDanger: "#DC2626",
  statusDangerTint: "#FEF2F2",
};

export const DARK_THEME: ColorTokens = {
  bgBase: "#1B1715", // Solar Dusk Dark Canvas (Twilight Umber)
  bgSurface: "#241F1C", // Solar Dusk Dark Surface (Obsidian Dusk)
  bgElevated: "#2D2723",
  bgMuted: "#2E2723",
  borderSubtle: "rgba(220, 200, 180, 0.12)",
  borderTactical: "rgba(242, 108, 42, 0.25)",
  borderFocus: "#F26C2A",
  textPrimary: "#F6F4F2", // Star-White
  textSecondary: "#C8BEB5",
  textMuted: "#A29B94",
  statusNominal: "#34D399",
  statusNominalTint: "rgba(52, 211, 153, 0.15)",
  statusWarning: "#F26C2A",
  statusWarningTint: "rgba(242, 108, 42, 0.15)",
  statusActive: "#F26C2A", // Solar Dusk Sunset Orange
  statusActiveTint: "rgba(242, 108, 42, 0.18)",
  statusDanger: "#EF4444",
  statusDangerTint: "rgba(239, 68, 68, 0.15)",
};

export const SYSTEM_META = {
  problemStatement: "SIH-26123",
  title: "EdgeFleet: Distributed Edge-AI Fleet Coordination",
  organization: "Smart India Hackathon 2026 / Bharat Electronics Limited (BEL) Benchmark",
  standardCompliance: ["ISO 3691-4:2023 (AMR Safety)", "IEC 62443-4-2 (Security)", "SIL-2 Zero-Motion Observer"],
};
