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

export function AnimatedCounter({
  value,
  duration = 1400,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          startAnimation();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    const startAnimation = () => {
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic: 1 - pow(1 - progress, 3)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentVal = easeProgress * value;

        setDisplayValue(currentVal);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
        }
      };

      requestAnimationFrame(animate);
    };

    return () => {
      observer.disconnect();
    };
  }, [value, duration]);

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();

  return (
    <span ref={elementRef} className={`animated-counter ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
