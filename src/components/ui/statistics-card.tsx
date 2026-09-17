"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StatisticsCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string | number;
  className?: string;
  icon?: React.ReactNode;
  higherIsBetter?: boolean;
}

export function StatisticsCard({
  label,
  value,
  unit,
  trend,
  trendValue,
  className,
  icon,
  higherIsBetter = true,
}: StatisticsCardProps) {
  const isPositive = trend === "up" ? higherIsBetter : trend === "down" ? !higherIsBetter : true;
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg",
        "before:absolute before:-left-4 before:-top-4 before:h-24 before:w-24 before:rounded-full before:bg-gradient-to-br before:from-emerald-500/10 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100",
        className
      )}
    >
      <div className="relative z-10 flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
            {icon}
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
      </div>

      {trend && trendValue && (
        <div className="relative z-10 mt-4 flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
              trend === "neutral"
                ? "bg-secondary text-muted-foreground"
                : isPositive
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-rose-500/10 text-rose-500"
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            <span>{trendValue}</span>
          </div>
          <span className="text-xs text-muted-foreground">vs baseline</span>
        </div>
      )}
    </div>
  );
}
