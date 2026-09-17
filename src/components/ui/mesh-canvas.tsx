"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  id: string;
  isBeacon?: boolean;
}

interface Packet {
  fromIndex: number;
  toIndex: number;
  progress: number;
  speed: number;
}

export function MeshCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 500;
    };

    window.addEventListener("resize", handleResize);

    // Mouse tracker
    const mouse = { x: -1000, y: -1000, radius: 140 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Generate Mesh Nodes (Simulating AMR Peer Nodes & Beacons)
    const nodeCount = Math.min(38, Math.floor(width / 32));
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: i % 7 === 0 ? 3.8 : 2.2,
        pulsePhase: Math.random() * Math.PI * 2,
        id: i % 7 === 0 ? `BCN-${i}` : `AMR-${i}`,
        isBeacon: i % 7 === 0,
      });
    }

    // Packets moving along links
    const packets: Packet[] = [];
    for (let i = 0; i < 6; i++) {
      packets.push({
        fromIndex: Math.floor(Math.random() * nodeCount),
        toIndex: Math.floor(Math.random() * nodeCount),
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.008,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = theme === "dark";
      const lineColor = isDark ? "rgba(56, 189, 248, " : "rgba(37, 99, 235, ";
      const nodeColor = isDark ? "#38bdf8" : "#2563eb";
      const beaconColor = isDark ? "#10b981" : "#059669";
      const packetColor = isDark ? "#ffffff" : "#1d4ed8";

      // 1. Update and draw nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off canvas borders
        if (node.x <= 0 || node.x >= width) node.vx *= -1;
        if (node.y <= 0 || node.y >= height) node.vy *= -1;

        // Mouse interaction (gentle deflection)
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          node.x -= (dx / dist) * force * 1.8;
          node.y -= (dy / dist) * force * 1.8;
        }

        // Pulse calculation
        node.pulsePhase += 0.04;
        const pulse = Math.sin(node.pulsePhase) * 0.5 + 0.5;

        // Draw node aura
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + pulse * 3, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(56, 189, 248, ${0.15 * pulse})`
          : `rgba(37, 99, 235, ${0.12 * pulse})`;
        ctx.fill();

        // Draw core node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.isBeacon ? beaconColor : nodeColor;
        ctx.fill();
      });

      // 2. Draw connections (links)
      const maxDistance = 125;
      const activePairs: [number, number][] = [];

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            activePairs.push([i, j]);
            const alpha = (1 - dist / maxDistance) * (isDark ? 0.35 : 0.22);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `${lineColor}${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // 3. Draw animated packets along active connections
      if (activePairs.length > 0) {
        packets.forEach((packet) => {
          packet.progress += packet.speed;
          if (packet.progress >= 1) {
            packet.progress = 0;
            const randomPair = activePairs[Math.floor(Math.random() * activePairs.length)];
            if (randomPair) {
              packet.fromIndex = randomPair[0];
              packet.toIndex = randomPair[1];
            }
          }

          const from = nodes[packet.fromIndex];
          const to = nodes[packet.toIndex];
          if (from && to) {
            const px = from.x + (to.x - from.x) * packet.progress;
            const py = from.y + (to.y - from.y) * packet.progress;

            // Packet glow dot
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = packetColor;
            ctx.shadowColor = packetColor;
            ctx.shadowBlur = isDark ? 8 : 4;
            ctx.fill();
            ctx.shadowBlur = 0; // reset
          }
        });
      }

      // 4. Draw mouse pointer radar ping wave if mouse is inside canvas
      if (mouse.x > 0 && mouse.y > 0) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 45, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? "rgba(56, 189, 248, 0.25)" : "rgba(37, 99, 235, 0.2)";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`mesh-canvas ${className}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
        zIndex: 0,
        opacity: 0.85,
      }}
      aria-hidden="true"
    />
  );
}
