"use client";

import { useState, useEffect } from "react";

interface PerspectiveTickerProps {
  items?: string[];
  intervalMs?: number;
  className?: string;
}

const DEFAULT_ITEMS = [
  "PEER MESH ACTIVE // 3/3 V2V QUORUM",
  "ZERO CLOUD SPOF // 100% LOCAL RESILIENCE",
  "P95 LATENCY < 150MS // BOUNDED CONSENSUS",
  "SPACE-TIME MUTEX // ZERO DEADLOCK LEASES",
  "ACTUATOR ISOLATION // ZERO-MOTION GUARANTEE",
];

export function PerspectiveTicker({
  items = DEFAULT_ITEMS,
  intervalMs = 3200,
  className = "",
}: PerspectiveTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, intervalMs]);

  return (
    <div className={`perspective-flip-wrap ${className}`}>
      {items.map((text, idx) => {
        let status = "upcoming";
        if (idx === currentIndex) status = "active";
        else if (idx === (currentIndex - 1 + items.length) % items.length) status = "leaving";

        return (
          <div
            key={idx}
            className={`perspective-flip-word ${status}`}
            aria-hidden={idx !== currentIndex}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "var(--solar-terracotta)",
                  boxShadow: "0 0 8px rgba(194, 84, 26, 0.3)",
                  flexShrink: 0,
                }}
              />
              <span className="text-display-emphasis" style={{ fontSize: "inherit" }}>
                {text}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
