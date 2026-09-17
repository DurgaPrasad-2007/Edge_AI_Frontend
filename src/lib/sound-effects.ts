"use client";

// Web Audio API Synthesized Sound Effects
// Zero external audio assets required — purely client-side synthesized micro-haptics.

let audioCtx: AudioContext | null = null;
let soundEnabled = false;

// Initialize sound setting from localStorage
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("edgefleet_audio_enabled");
  soundEnabled = saved === "true";
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isAudioEnabled(): boolean {
  return soundEnabled;
}

export function setAudioEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  if (typeof window !== "undefined") {
    localStorage.setItem("edgefleet_audio_enabled", enabled ? "true" : "false");
  }
}

export function toggleAudio(): boolean {
  setAudioEnabled(!soundEnabled);
  if (soundEnabled) {
    playChirp();
  }
  return soundEnabled;
}

// 1. Tactile Mechanical Click (Button presses, card clicks)
export function playClick(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(820, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.035);

  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.035);
}

// 2. High-Tech Telemetry Chirp (Mode change, node selection, packet sent)
export function playChirp(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.035, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.06);
}

// 3. Space-Time Lease Acquired / Success Chord
export function playLeaseAcquired(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  [587.33, 880, 1174.66].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.04);

    gain.gain.setValueAtTime(0.025, ctx.currentTime + i * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.04 + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + i * 0.04);
    osc.stop(ctx.currentTime + i * 0.04 + 0.12);
  });
}

// 4. Tactical Warning Ping (Obstacle injected, collision alert, reroute)
export function playWarning(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.setValueAtTime(330, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.18);
}

// 5. Radar Sweep Ping
export function playRadarPing(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(1760, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.03, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.14);
}
