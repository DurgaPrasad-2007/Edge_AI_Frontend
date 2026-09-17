"use client";

import { cn } from "@/lib/utils";

export function BackgroundGradientBranded({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full bg-slate-950 overflow-hidden flex flex-col",
        className
      )}
    >
      <div className="absolute inset-0 w-full h-full bg-slate-950 z-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {/* Background Mesh */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0" />
      
      {/* Glows */}
      <div className="absolute top-0 -translate-y-12 w-[600px] h-[300px] bg-emerald-500/20 blur-[100px] rounded-full z-0 opacity-50" />
      <div className="absolute bottom-0 translate-y-12 w-[600px] h-[300px] bg-sky-500/20 blur-[100px] rounded-full z-0 opacity-30" />
      
      <div className="relative z-10 w-full h-full flex flex-col">{children}</div>
    </div>
  );
}
