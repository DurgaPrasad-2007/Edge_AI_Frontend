"use client";

import { useEffect, useState } from "react";
import { Cpu, Wifi, Zap, HardDrive } from "lucide-react";
import { API_BASE, type BenchmarkResult } from "@/lib/use-fleet-socket";

/** Every number in this section is measured by the backend (GET /api/benchmark), never typed in. */
function useBenchmark() {
  const [data, setData] = useState<BenchmarkResult | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/benchmark`)
      .then((res) => (res.ok ? (res.json() as Promise<BenchmarkResult>) : Promise.reject(new Error(String(res.status)))))
      .then((json) => !cancelled && setData(json))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);
  return { data, failed };
}

function Bar({ label, seconds, max, accent }: { label: string; seconds: number; max: number; accent: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 64px", alignItems: "center", gap: 10, fontSize: 12 }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <div style={{ height: 10, borderRadius: 5, background: "var(--bg-muted)", overflow: "hidden" }}>
        <div
          style={{
            width: `${Math.max(4, (seconds / max) * 100)}%`,
            height: "100%",
            borderRadius: 5,
            background: accent ? "var(--status-active)" : "var(--text-muted)",
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <span className="mono-metric" style={{ fontWeight: 700, textAlign: "right" }}>{seconds.toFixed(0)} s</span>
    </div>
  );
}

function MeasuredBenchmark() {
  const { data, failed } = useBenchmark();

  if (failed) {
    return (
      <div className="card-hairline" style={{ padding: 20, marginBottom: 36, fontSize: 13, color: "var(--text-secondary)" }}>
        The benchmark is measured by the backend on request and it is not reachable right now. Start the API to see the live comparison.
      </div>
    );
  }
  if (!data) {
    return (
      <div role="status" className="card-hairline" style={{ padding: 20, marginBottom: 36, display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>
        <span className="animate-spin" style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--border-tactical)", borderTopColor: "var(--status-active)" }} />
        Running the benchmark: 200 headless simulations (first load only, about 10 s)…
      </div>
    );
  }

  const met = data.reduction_pct >= data.target_pct;
  const max = Math.max(data.stop_and_wait_mission_seconds, data.decentralized_mission_seconds);
  return (
    <div className="card-hairline" style={{ padding: 22, marginBottom: 36 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            Total mission completion time vs stop-and-wait
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span className="mono-metric" style={{ fontSize: 40, fontWeight: 800, color: "var(--status-active)", lineHeight: 1.1 }}>
              −{data.reduction_pct.toFixed(1)}%
            </span>
            <span className={`badge ${met ? "badge-nominal" : "badge-warning"}`}>
              {met ? `Meets the ${data.target_pct}% target` : `Below the ${data.target_pct}% target`}
            </span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", maxWidth: 420, lineHeight: 1.5 }}>
          {data.workload}. Same robots, same physics, same assignments; only how conflicts are handled differs.
        </div>
      </div>

      <div style={{ display: "grid", gap: 8, marginBottom: 18 }}>
        <Bar label="Stop-and-wait" seconds={data.stop_and_wait_mission_seconds} max={max} accent={false} />
        <Bar label="Decentralized mesh" seconds={data.decentralized_mission_seconds} max={max} accent />
      </div>

      <div className="data-table-container" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Metric (average per run)</th>
              <th>Stop-and-wait</th>
              <th>Decentralized mesh</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Sum of mission times</strong></td>
              <td><span className="mono-metric">{data.stop_and_wait_mission_seconds.toFixed(0)} s</span></td>
              <td><span className="mono-metric" style={{ fontWeight: 700, color: "var(--status-active)" }}>{data.decentralized_mission_seconds.toFixed(0)} s</span></td>
              <td><span className="badge badge-active">−{data.reduction_pct.toFixed(1)}%</span></td>
            </tr>
            <tr>
              <td><strong>Fleet makespan (all missions done)</strong></td>
              <td><span className="mono-metric">{data.stop_and_wait_makespan_seconds.toFixed(0)} s</span></td>
              <td><span className="mono-metric" style={{ fontWeight: 700, color: "var(--status-active)" }}>{data.decentralized_makespan_seconds.toFixed(0)} s</span></td>
              <td><span className="badge badge-active">−{data.makespan_reduction_pct.toFixed(1)}%</span></td>
            </tr>
            <tr>
              <td><strong>Time robots spend waiting</strong></td>
              <td><span className="mono-metric">baseline</span></td>
              <td><span className="mono-metric" style={{ fontWeight: 700, color: "var(--status-active)" }}>much less</span></td>
              <td><span className="badge badge-active">−{data.waiting_reduction_pct.toFixed(1)}%</span></td>
            </tr>
            <tr>
              <td><strong>Collisions</strong></td>
              <td><span className="mono-metric">{data.collisions_stop_and_wait}</span></td>
              <td><span className="mono-metric" style={{ fontWeight: 700, color: "var(--status-active)" }}>{data.collisions_decentralized}</span></td>
              <td><span className="badge badge-nominal">{data.all_completed ? "All missions completed" : "Some runs did not finish"}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 14, marginBottom: 0 }}>
        Read this honestly: across {data.runs} randomised runs the median saving is {data.median_reduction_pct.toFixed(1)}%, and in {data.runs_slower} of {data.runs} runs
        the mesh was slower than stop-and-wait. The seed set was fixed before measuring and was not tuned to the result. This is a
        simulation on one warehouse layout with 3 AMRs, not a hardware measurement.
      </p>
    </div>
  );
}

export function BenchmarkSection() {
  return (
    <section id="benchmarks" className="content-section" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div className="section-header" style={{ marginBottom: 32 }}>
        <div className="section-kicker">Measured, Not Claimed</div>
        <h2 className="section-display-title">
          <span className="text-display-muted">Decentralized vs Stop-and-Wait. </span>
          <span className="text-display-emphasis">Live Benchmark.</span>
        </h2>
        <p className="section-description">
          Success criteria: zero inter-robot collisions and at least 20% lower total task completion time than
          traditional stop-and-wait when paths overlap. These numbers are computed by the backend from deterministic
          headless runs of the very same robot agents you can watch above.
        </p>
      </div>

      <MeasuredBenchmark />

      {/* Hardware & Edge Specifications */}
      <div id="specs" style={{ marginTop: 28 }}>
        <div className="section-header" style={{ marginBottom: 24 }}>
          <div className="section-kicker">Deployment Target</div>
          <h3 className="section-display-title" style={{ fontSize: "1.5rem" }}>
            <span className="text-display-muted">Onboard AMR Compute. </span>
            <span className="text-display-emphasis">Design Reference.</span>
          </h3>
          <p className="section-description">
            What each robot agent is designed to run on. This repository simulates the fleet on a laptop; none of the
            figures below are measured here.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 28 }}>
          {[
            { icon: <Cpu className="w-4 h-4 text-blue-600" />, kicker: "Compute Engine", title: "Raspberry Pi 5 / Jetson-class", body: "One agent process per robot: its own control loop, its own view of its peers, its own planner." },
            { icon: <Wifi className="w-4 h-4" style={{ color: "var(--status-active)" }} />, kicker: "Peer Transport", title: "Pub/sub mesh", body: "In-process bus in this simulation with broadcast and direct messages, inboxes and a radio-silence switch. Built to be swapped for Zenoh/DDS." },
            { icon: <Zap className="w-4 h-4 text-amber-600" />, kicker: "Sensing", title: "Simulated ground truth", body: "Robots read only their own pose and sense obstacles; other robots' internal state is never shared, only what they broadcast." },
            { icon: <HardDrive className="w-4 h-4 text-purple-600" />, kicker: "Audit Storage & RAG", title: "PostgreSQL + pgvector", body: "Write-behind task and audit logging, plus 384-d cosine similarity incident search." },
          ].map((card) => (
            <div key={card.kicker} className="card-hairline" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {card.icon}
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.04em" }}>{card.kicker}</span>
              </div>
              <strong style={{ fontSize: 14, color: "var(--text-primary)" }}>{card.title}</strong>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
