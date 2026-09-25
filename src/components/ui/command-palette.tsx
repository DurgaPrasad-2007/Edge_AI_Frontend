"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { toggleAudio, isAudioEnabled, playClick, playChirp } from "@/lib/sound-effects";
import {
  Search,
  Terminal,
  Activity,
  Radio,
  Sliders,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  X,
  Command,
} from "lucide-react";

interface CommandPaletteProps {
  onInjectBlockage?: () => void;
  onResetFloor?: () => void;
  onToggleRunning?: () => void;
  onToggleRadar?: () => void;
}

interface ActionItem {
  id: string;
  category: "Navigation" | "Simulation" | "System";
  title: string;
  description: string;
  icon: React.ReactNode;
  shortcut?: string;
  perform: () => void;
}

export function CommandPalette({
  onInjectBlockage,
  onResetFloor,
  onToggleRunning,
  onToggleRadar,
}: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [audioActive, setAudioActive] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setAudioActive(isAudioEnabled());
  }, []);

  // Keyboard shortcut listener (Cmd+K, Ctrl+K, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) playChirp();
          return next;
        });
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const actions: ActionItem[] = [
    {
      id: "nav-simulator",
      category: "Navigation",
      title: "Jump to Live Digital Twin Simulator",
      description: "Warehouse Zone 02 floor map & peer arbitration",
      icon: <Activity className="w-4 h-4" style={{ color: "var(--solar-terracotta)" }} />,
      shortcut: "G S",
      perform: () => {
        document.getElementById("simulator")?.scrollIntoView({ behavior: "smooth" });
        setIsOpen(false);
      },
    },
    {
      id: "nav-protocol",
      category: "Navigation",
      title: "Jump to Protocol Consensus Loop",
      description: "4-stage peer consensus: intent broadcast, mutex lease, transit, ACK",
      icon: <Layers className="w-4 h-4" style={{ color: "var(--solar-terracotta)" }} />,
      shortcut: "G P",
      perform: () => {
        document.getElementById("protocol-flow")?.scrollIntoView({ behavior: "smooth" });
        setIsOpen(false);
      },
    },
    {
      id: "nav-architecture",
      category: "Navigation",
      title: "Jump to Mathematical Architecture",
      description: "Formal space-time reservations, dynamic windows, and Bellman-Ford formulations",
      icon: <Shield className="w-4 h-4" style={{ color: "var(--solar-terracotta)" }} />,
      shortcut: "G A",
      perform: () => {
        document.getElementById("architecture")?.scrollIntoView({ behavior: "smooth" });
        setIsOpen(false);
      },
    },
    {
      id: "nav-console",
      category: "Navigation",
      title: "Open Operator Console",
      description: "Real-time telemetry streams, mission logs, and ROS 2 bus",
      icon: <Terminal className="w-4 h-4" style={{ color: "var(--solar-terracotta)" }} />,
      shortcut: "G C",
      perform: () => {
        router.push("/console");
        setIsOpen(false);
      },
    },
    {
      id: "sim-obstacle",
      category: "Simulation",
      title: "Toggle Aisle Obstacle",
      description: "Robots whose routes cross the blocked aisle replan with A*",
      icon: <Sliders className="w-4 h-4 text-amber-500" />,
      shortcut: "B",
      perform: () => {
        onInjectBlockage?.();
        setIsOpen(false);
      },
    },
    {
      id: "sim-radar",
      category: "Simulation",
      title: "Toggle Radar / LIDAR Safety Cones",
      description: "Visualize 360-degree optical detection envelopes",
      icon: <Radio className="w-4 h-4 text-sky-500" />,
      shortcut: "R",
      perform: () => {
        onToggleRadar?.();
        setIsOpen(false);
      },
    },
    {
      id: "sim-toggle",
      category: "Simulation",
      title: "Play / Pause Fleet Simulation",
      description: "Toggle deterministic 600ms tick cycle",
      icon: <Activity className="w-4 h-4" style={{ color: "var(--solar-terracotta)" }} />,
      shortcut: "Space",
      perform: () => {
        onToggleRunning?.();
        setIsOpen(false);
      },
    },
    {
      id: "sim-reset",
      category: "Simulation",
      title: "Reset Warehouse Floor",
      description: "Return all 3 AMRs to home origin waypoints",
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      perform: () => {
        onResetFloor?.();
        setIsOpen(false);
      },
    },
    {
      id: "sys-theme",
      category: "System",
      title: `Switch Theme to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      description: "Toggle calibrated industrial light or dark tokens",
      icon: theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />,
      shortcut: "T",
      perform: () => {
        toggleTheme();
        setIsOpen(false);
      },
    },
    {
      id: "sys-audio",
      category: "System",
      title: audioActive ? "Disable Tactile Audio Feedback" : "Enable Tactile Audio Feedback",
      description: "Micro-haptic clicks, sonar pings, and telemetry chords",
      icon: audioActive ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-amber-500" />,
      perform: () => {
        const next = toggleAudio();
        setAudioActive(next);
        setIsOpen(false);
      },
    },
  ];

  const filteredActions = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.description.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
      playClick();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
      playClick();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const action = filteredActions[selectedIndex];
      if (action) {
        playClick();
        action.perform();
      }
    }
  };

  return (
    <>
      {/* Floating Tactical Trigger Button in Bottom Right */}
      <button
        type="button"
        onClick={() => {
          playChirp();
          setIsOpen(true);
        }}
        className="tactile-floating-btn"
        aria-label="Open Command Palette (⌘K)"
        title="Open Command Palette (⌘K)"
      >
        <Command className="w-3.5 h-3.5" style={{ color: "var(--solar-terracotta)" }} />
        <span className="floating-btn-text">Quick Actions</span>
        <kbd className="floating-btn-kbd">⌘K</kbd>
      </button>

      {/* Backdrop & Modal */}
      {isOpen && (
        <div
          className="cmd-backdrop"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette"
        >
          <div
            className="cmd-dialog glass-panel"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Input Header */}
            <div className="cmd-header">
              <Search className="w-4 h-4 text-muted" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or jump to section... (e.g. 'obstacle', 'simulator', 'theme')"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="cmd-input"
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="cmd-close-btn"
                aria-label="Close Command Palette"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Items List */}
            <div className="cmd-list" role="listbox">
              {filteredActions.length === 0 ? (
                <div className="cmd-empty">No matching actions found</div>
              ) : (
                filteredActions.map((action, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={action.id}
                      role="option"
                      aria-selected={isSelected}
                      className={`cmd-item ${isSelected ? "selected" : ""}`}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => {
                        playClick();
                        action.perform();
                      }}
                    >
                      <div className="cmd-item-icon">{action.icon}</div>
                      <div className="cmd-item-details">
                        <div className="cmd-item-title">{action.title}</div>
                        <div className="cmd-item-sub">{action.description}</div>
                      </div>
                      {action.shortcut && (
                        <div className="cmd-item-shortcut mono-tag">{action.shortcut}</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Tip */}
            <div className="cmd-footer">
              <div className="cmd-keys">
                <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
                <span><kbd>↵</kbd> Select</span>
                <span><kbd>Esc</kbd> Close</span>
              </div>
              <div className="cmd-status">EdgeFleet Peer OS &middot; v2.4.0</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
