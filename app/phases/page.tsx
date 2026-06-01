"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { getAllPhases } from "../../services";
import Spinner from "../../components/ui/Spinner";
import { YEARS_WITH_DATA } from "../../constants/phases";

const formatPKR = (n: number) => "₨ " + Math.round(n).toLocaleString("en-PK");

/* Phase tokens — single muted accent across all phases for a cohesive, professional palette */
const PHASE_THEMES: Record<string, { accent: string; light: string; gradient: string }> = {
  "Phase 1": { accent: "#059669", light: "rgba(5,150,105,0.08)", gradient: "#059669" },
  "Phase 2": { accent: "#059669", light: "rgba(5,150,105,0.08)", gradient: "#059669" },
  "Phase 3": { accent: "#059669", light: "rgba(5,150,105,0.08)", gradient: "#059669" },
  "Phase P": { accent: "#059669", light: "rgba(5,150,105,0.08)", gradient: "#059669" },
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  :root {
    --bg: #f4f6f9;
    --surface: #ffffff;
    --surface-2: #f8fafc;
    --surface-3: #f1f5f9;
    --border: rgba(0,0,0,0.07);
    --border-mid: rgba(0,0,0,0.13);
    --accent: #059669;
    --accent-dim: rgba(5,150,105,0.08);
    --red: #e11d48;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #94a3b8;
    --shadow-sm: 0 1px 3px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.04);
    --shadow-md: 0 4px 12px rgba(15,23,42,0.07), 0 1px 4px rgba(15,23,42,0.04);
    --radius-lg: 16px;
    --radius: 12px;
    --radius-sm: 8px;
    --radius-xs: 6px;
  }

  .ph-root * { box-sizing: border-box; }

  .ph-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg);
    color: var(--text-primary);
    min-height: 100vh;
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
  }
  [dir="rtl"] .ph-root { font-family: 'Noto Nastaliq Urdu', 'Plus Jakarta Sans', sans-serif; }

  /* ── Page Header ── */
  .page-header {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  .header-eyebrow {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }
  .eyebrow-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent);
  }
  .eyebrow-text {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .page-title {
    font-size: 19px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.2px;
    line-height: 1.25;
  }
  .page-sub {
    font-size: 12.5px;
    color: var(--text-secondary);
    margin-top: 4px;
    font-weight: 500;
    max-width: 480px;
  }

  /* ── Year Selector ── */
  .year-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 1px solid var(--border-mid);
    border-radius: 8px;
    padding: 6px 12px;
    flex-shrink: 0;
  }
  .year-label {
    font-size: 9.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }
  .year-select {
    background: transparent;
    border: none;
    font-family: inherit;
    font-size: 12.5px;
    font-weight: 700;
    color: var(--text-primary);
    cursor: pointer;
    outline: none;
    padding: 0;
  }
  .year-select option { background: #fff; color: #0f172a; }

  /* ── Phase Card ── */
  .phase-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
    overflow: hidden;
    margin-bottom: 14px;
    transition: box-shadow 0.15s, border-color 0.15s;
  }
  .phase-card:hover { box-shadow: 0 2px 8px rgba(15,23,42,0.06); border-color: var(--border-mid); }
  .phase-card-stripe {
    height: 2px;
    background: var(--accent);
    flex-shrink: 0;
  }
  .phase-card-body {
    padding: 16px 20px;
  }

  .phase-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }
  .phase-head-left { display: flex; align-items: center; gap: 12px; }
  .phase-avatar {
    width: 42px; height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-dim);
    color: var(--accent);
    border: 1px solid var(--accent-mid);
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 11.5px;
    text-align: center;
    line-height: 1.1;
    flex-shrink: 0;
    padding: 4px;
  }
  .phase-name {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.2px;
    line-height: 1.2;
  }
  .phase-blocks-line {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 500;
    margin-top: 2px;
  }
  .phase-blocks-line strong { color: var(--text-secondary); font-weight: 600; }

  .phase-rate-wrap { text-align: right; flex-shrink: 0; }
  .phase-rate {
    font-size: 22px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: -0.4px;
    line-height: 1.1;
  }
  .phase-rate-label {
    font-size: 9.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
    margin-top: 3px;
  }

  /* Progress */
  .progress-track {
    width: 100%;
    height: 5px;
    background: var(--surface-3);
    border-radius: 99px;
    overflow: hidden;
    margin-bottom: 14px;
  }
  .progress-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.6s ease;
  }

  /* Metrics grid */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--border);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border);
    margin-bottom: 14px;
  }
  @media (max-width: 700px) { .metrics-grid { grid-template-columns: repeat(2, 1fr); } }

  .metric-cell {
    background: var(--surface-2);
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .metric-cell:hover { background: var(--surface-3); }
  .metric-label {
    font-size: 9.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }
  .metric-value {
    font-size: 13px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: -0.2px;
    line-height: 1.2;
  }
  .metric-value.green { color: var(--accent); }
  .metric-value.red { color: var(--red); }
  .metric-value.dark { color: var(--text-primary); }
  .metric-value.blue { color: #2563eb; }

  /* Block grid */
  .blocks-title {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
    margin-bottom: 8px;
  }
  .phase-blocks-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
  }
  @media (max-width: 1100px) { .phase-blocks-grid { grid-template-columns: repeat(4, 1fr); } }
  @media (max-width: 700px) { .phase-blocks-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 480px) { .phase-blocks-grid { grid-template-columns: repeat(2, 1fr); } }

  .block-mini {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 10px;
    text-decoration: none;
    color: inherit;
    transition: all 0.12s;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .block-mini:hover {
    border-color: var(--border-mid);
    background: var(--surface);
  }
  .block-mini-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .block-mini-name {
    font-size: 11.5px;
    font-weight: 700;
    color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace;
  }
  .block-mini-rate {
    font-size: 11.5px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
  }
  .block-mini-track {
    width: 100%;
    height: 3px;
    background: var(--surface-3);
    border-radius: 99px;
    overflow: hidden;
  }
  .block-mini-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.6s ease;
  }

  /* States */
  .center-spinner { display: flex; justify-content: center; align-items: center; min-height: 280px; }

  .fade-in { animation: fadeUp 0.3s ease both; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 640px) {
    .ph-root { padding: 16px; }
    .page-header { padding: 18px 20px; }
    .page-title { font-size: 21px; }
    .phase-card-body { padding: 18px 18px; }
    .phase-rate { font-size: 24px; }
  }
`;

export default function PhasesPage() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [phases, setPhases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchPhases = async () => {
      setLoading(true);
      try {
        const data = await getAllPhases(year);
        if (active) setPhases(data || []);
      } catch (err) {
        console.error("Failed to fetch phases:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchPhases();
    return () => { active = false; };
  }, [year]);

  return (
    <>
      <style>{styles}</style>
      <div className="ph-root">

        {/* ── Header ── */}
        <div className="page-header">
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="header-eyebrow">
              <div className="eyebrow-dot" />
              <span className="eyebrow-text">{t("phases.eyebrow")}</span>
            </div>
            <h1 className="page-title">{t("phases.title")}</h1>
            <p className="page-sub">{t("phases.subtitle")}</p>
          </div>

          <div className="year-selector">
            <span className="year-label">{t("common.year")}</span>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="year-select"
            >
              {[...YEARS_WITH_DATA].reverse().map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="center-spinner"><Spinner /></div>
        ) : (
          <div className="fade-in">
            {phases.map((phase) => {
              const theme = PHASE_THEMES[phase.phase] || PHASE_THEMES["Phase 1"];
              const rate = phase.collectionRate || 0;
              return (
                <div key={phase.phase} className="phase-card">
                  <div className="phase-card-stripe" style={{ background: theme.gradient }} />
                  <div className="phase-card-body">

                    <div className="phase-head">
                      <div className="phase-head-left">
                        <div
                          className="phase-avatar"
                          style={{ background: theme.gradient }}
                        >
                          {phase.phase}
                        </div>
                        <div>
                          <div className="phase-name">{t("phases.overview", { phase: phase.phase })}</div>
                          <div className="phase-blocks-line">
                            {t("phases.blocksRegistered")}:{" "}
                            <strong>
                              {(phase.blockStats || []).map((b: any) => b.block).join(", ") || "—"}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="phase-rate-wrap">
                        <div className="phase-rate" style={{ color: theme.accent }}>{rate}%</div>
                        <div className="phase-rate-label">{t("blocks.collectionRate")}</div>
                      </div>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.min(100, rate)}%`, background: theme.gradient }}
                      />
                    </div>

                    <div className="metrics-grid">
                      <div className="metric-cell">
                        <span className="metric-label">{t("phases.totalPlots")}</span>
                        <span className="metric-value blue">{phase.totalPlots}</span>
                      </div>
                      <div className="metric-cell">
                        <span className="metric-label">{t("phases.collectedAmount")}</span>
                        <span className="metric-value green">{formatPKR(phase.totalCollected)}</span>
                      </div>
                      <div className="metric-cell">
                        <span className="metric-label">{t("phases.totalDues")}</span>
                        <span className="metric-value dark">{formatPKR(phase.totalDue)}</span>
                      </div>
                      <div className="metric-cell">
                        <span className="metric-label">{t("phases.outstandingOverdue")}</span>
                        <span className="metric-value red">{formatPKR(phase.remaining)}</span>
                      </div>
                    </div>

                    {phase.blockStats && phase.blockStats.length > 0 && (
                      <>
                        <div className="blocks-title">{t("phases.individualBlockStatus")}</div>
                        <div className="phase-blocks-grid">
                          {phase.blockStats.map((bs: any) => (
                            <Link key={bs.block} href={`/blocks/${bs.block}`} className="block-mini">
                              <div className="block-mini-head">
                                <span className="block-mini-name">{bs.block}</span>
                                <span className="block-mini-rate" style={{ color: theme.accent }}>
                                  {bs.collectionRate}%
                                </span>
                              </div>
                              <div className="block-mini-track">
                                <div
                                  className="block-mini-fill"
                                  style={{
                                    width: `${Math.min(100, bs.collectionRate)}%`,
                                    background: theme.gradient,
                                  }}
                                />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
