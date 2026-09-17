"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlowingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  active?: boolean;
  colorTheme?: "emerald" | "rose" | "purple" | "sky" | "orange" | "red" | "amber";
}

const colorMap = {
  emerald: "from-emerald-500/80 to-emerald-700 shadow-emerald-500/25",
  rose: "from-rose-500/80 to-rose-700 shadow-rose-500/25",
  purple: "from-purple-500/80 to-purple-700 shadow-purple-500/25",
  sky: "from-sky-500/80 to-sky-700 shadow-sky-500/25",
  orange: "from-orange-500/80 to-orange-700 shadow-orange-500/25",
  red: "from-red-500/80 to-red-700 shadow-red-500/25",
  amber: "from-amber-500/80 to-amber-700 shadow-amber-500/25",
};

const borderMap = {
  emerald: "border-emerald-500/30 group-hover:border-emerald-400/50",
  rose: "border-rose-500/30 group-hover:border-rose-400/50",
  purple: "border-purple-500/30 group-hover:border-purple-400/50",
  sky: "border-sky-500/30 group-hover:border-sky-400/50",
  orange: "border-orange-500/30 group-hover:border-orange-400/50",
  red: "border-red-500/30 group-hover:border-red-400/50",
  amber: "border-amber-500/30 group-hover:border-amber-400/50",
};

export function GlowingButton({
  children,
  className,
  active,
  colorTheme = "emerald",
  ...props
}: GlowingButtonProps) {
  const c = colorMap[colorTheme];
  const b = borderMap[colorTheme];
  return (
    <button
      {...props}
      className={cn(
        "relative group isolate px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all overflow-hidden",
        "border",
        b,
        active ? "text-white" : "text-white/80 hover:text-white",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 -z-10 transition-all duration-300 opacity-0 group-hover:opacity-100",
          "bg-gradient-to-tr",
          c
        )}
      />
      {active && (
        <div
          className={cn(
            "absolute inset-0 -z-10 bg-gradient-to-tr opacity-70",
            c
          )}
        />
      )}
      {!active && (
        <div className="absolute inset-0 -z-10 bg-slate-900/60" />
      )}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">{children}</div>
    </button>
  );
}
