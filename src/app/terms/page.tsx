import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Terms of Service & Evaluation License — EdgeFleet",
  description: "Terms of use and software evaluation license governing EdgeFleet prototype and demonstration consoles.",
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main id="main-content" className="page-wrapper" style={{ flex: 1, paddingTop: 40 }}>
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <div style={{ marginBottom: 32, borderBottom: "1px solid var(--border-tactical)", paddingBottom: 20 }}>
            <span className="badge badge-active" style={{ marginBottom: 10 }}>
              INDUSTRIAL SOFTWARE EVALUATION
            </span>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              Terms of Service &amp; Evaluation License
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
              Smart India Hackathon 2026 / Evaluation Edition
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 28, fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)" }}>
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
                1. Prototype Evaluation Scope
              </h2>
              <p>
                EdgeFleet is provided for technical evaluation, academic review, and industrial feasibility demonstration
                under the guidelines of Smart India Hackathon (SIH) 2026 Problem Statement 26123.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
                2. Zero Physical Motion Warranty
              </h2>
              <p>
                The software demonstration console provides read-only observation and simulated peer-to-peer arbitration.
                Deployment on physical robotics requires certified SIL-2 functional safety controllers and physical E-Stop
                interlocks in compliance with ISO 3691-4.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
                3. Intellectual Property &amp; Open Architecture
              </h2>
              <p>
                EdgeFleet utilizes open robotics specifications, including Open-RMF and ROS 2 communication standards.
                Evaluators are granted a non-exclusive license to inspect, benchmark, and evaluate the fleet coordination code.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
