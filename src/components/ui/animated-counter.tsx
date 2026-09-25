"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number; // in ms
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Counts up when first scrolled into view, then eases to every new `value`
 * (so it can show live data, not just a number known at mount).
 */
export function AnimatedCounter({
  value,
  duration = 1400,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [visible, setVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const shownRef = useRef(0);
  const firstRun = useRef(true);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const from = shownRef.current;
    const span = firstRun.current ? duration : Math.min(duration, 500); // quick catch-up for live updates
    firstRun.current = false;
    const startTime = performance.now();
    let frame = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / span, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = from + (value - from) * eased;
      shownRef.current = current;
      setDisplayValue(current);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, visible]);

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();

  return (
    <span ref={elementRef} className={`animated-counter ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
