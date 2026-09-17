"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ThemeMode } from "@/lib/design-tokens";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("edgefleet_theme") as ThemeMode | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else {
      // Default is light theme as primary, but check if OS strongly prefers dark
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      // Primary default is light-first unless user has explicit preference
      const initialMode: ThemeMode = prefersDark ? "dark" : "light";
      setThemeState(initialMode);
      document.documentElement.setAttribute("data-theme", initialMode);
    }
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem("edgefleet_theme", mode);
    document.documentElement.setAttribute("data-theme", mode);
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
