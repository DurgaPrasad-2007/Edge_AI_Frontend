"use client";

import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-slate-700" aria-hidden="true" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
      )}
      <span className="theme-toggle-label">{theme === "light" ? "Dark" : "Light"}</span>
    </button>
  );
}
