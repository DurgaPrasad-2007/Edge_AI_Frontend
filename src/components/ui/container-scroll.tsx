"use client";

import React, { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

interface ContainerScrollProps {
  children: React.ReactNode;
  className?: string;
}

export function ContainerScroll({ children, className = "" }: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rotate = useTransform(scrollYProgress, [0, 0.45], [isMobile ? 0 : 12, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45], [isMobile ? 1 : 0.94, 1]);
  const translate = useTransform(scrollYProgress, [0, 0.45], [isMobile ? 0 : 30, 0]);

  return (
    <div
      ref={containerRef}
      className={`container-scroll-wrap ${className}`}
    >
      <motion.div
        style={{
          rotateX: rotate,
          scale,
          translateY: translate,
          transformStyle: "preserve-3d",
        }}
        className="container-scroll-card-layer"
      >
        {children}
      </motion.div>
    </div>
  );
}
