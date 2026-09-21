"use client";

import React, { useRef, useState, useCallback } from "react";
import { playClick } from "@/lib/sound-effects";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  tilt?: boolean;
  clickable?: boolean;
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(2, 132, 199, 0.06)",
  tilt = false,
  clickable = false,
  onClick,
  style,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);
  const [transformStyle, setTransformStyle] = useState("");

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePos({ x, y });
      setIsHovered(true);

      if (tilt) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4.5;
        const rotateY = ((x - centerX) / centerX) * 4.5;
        setTransformStyle(
          `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(4px)`
        );
      }
    },
    [tilt]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePos({ x: -1000, y: -1000 });
    setTransformStyle("perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)");
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (clickable || onClick) {
      playClick();
      onClick?.(e);
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`spotlight-card ${isHovered ? "is-hovered" : ""} ${className}`}
      style={{
        transform: transformStyle,
        transition: isHovered
          ? "transform 0.08s ease-out, border-color 0.2s ease"
          : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease",
        cursor: clickable ? "pointer" : "default",
        ...style,
      }}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Radial Overlay */}
      <div
        className="spotlight-layer"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(420px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Card Content Container */}
      <div className="spotlight-content" style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
