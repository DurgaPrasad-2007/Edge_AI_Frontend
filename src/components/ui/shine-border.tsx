"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShineBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: string | string[];
  borderWidth?: number;
  duration?: number;
}

export function ShineBorder({
  children,
  className,
  color = ["#A07CFE", "#FE8FB5", "#FFBE7B"],
  borderWidth = 1,
  duration = 14,
}: ShineBorderProps) {
  const colors = Array.isArray(color) ? color.join(",") : color;
  
  return (
    <div
      className={cn(
        "relative rounded-[inherit] bg-slate-900 overflow-hidden",
        className
      )}
      style={{
        padding: borderWidth,
      }}
    >
      <div
        className="absolute inset-0 z-0 animate-spin-slow opacity-80"
        style={{
          background: `conic-gradient(from 0deg, transparent 0 340deg, ${colors} 360deg)`,
          width: "200%",
          height: "200%",
          left: "-50%",
          top: "-50%",
          animationDuration: `${duration}s`,
        }}
      />
      <div className="relative z-10 bg-slate-950 w-full h-full rounded-[inherit] flex flex-col">
        {children}
      </div>
    </div>
  );
}
