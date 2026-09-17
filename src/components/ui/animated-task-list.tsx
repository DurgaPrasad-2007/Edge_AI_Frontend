"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: "pending" | "processing" | "completed" | "error";
  time?: string;
  icon?: React.ReactNode;
}

export function AnimatedTaskList({ tasks, className }: { tasks: TaskItem[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      <AnimatePresence initial={false}>
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 400, damping: 30, delay: index * 0.05 }}
            className={cn(
              "relative overflow-hidden rounded-xl border p-4 transition-colors",
              task.status === "completed" && "bg-emerald-500/10 border-emerald-500/20",
              task.status === "error" && "bg-rose-500/10 border-rose-500/20",
              task.status === "processing" && "bg-sky-500/10 border-sky-500/30",
              task.status === "pending" && "bg-secondary/40 border-border/50"
            )}
          >
            {task.status === "processing" && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500/10 to-transparent z-0"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            )}
            
            <div className="relative z-10 flex items-start gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                  task.status === "completed" && "border-emerald-500/50 bg-emerald-500/20 text-emerald-500",
                  task.status === "error" && "border-rose-500/50 bg-rose-500/20 text-rose-500",
                  task.status === "processing" && "border-sky-500/50 bg-sky-500/20 text-sky-500",
                  task.status === "pending" && "border-border bg-secondary text-muted-foreground"
                )}
              >
                {task.icon ? (
                  task.icon
                ) : task.status === "completed" ? (
                  <CheckIcon className="h-4 w-4" />
                ) : task.status === "error" ? (
                  <AlertCircleIcon className="h-4 w-4" />
                ) : task.status === "processing" ? (
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <CircleIcon className="h-4 w-4" />
                )}
              </div>
              
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={cn(
                    "text-sm font-semibold",
                    task.status === "completed" && "text-emerald-500",
                    task.status === "error" && "text-rose-500",
                    task.status === "processing" && "text-sky-500",
                    task.status === "pending" && "text-foreground"
                  )}>
                    {task.title}
                  </h4>
                  {task.time && (
                    <span className="text-xs font-mono text-muted-foreground">{task.time}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{task.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Minimal Icons
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function LoaderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
