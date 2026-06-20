"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { getAllBlocks } from "../../services";
import Spinner from "../../components/ui/Spinner";
import ErrorBanner from "../../components/ui/ErrorBanner";
import { BLOCK_PHASE_MAP, YEARS_WITH_DATA } from "../../constants/phases";

const formatPKR = (n: number) => "₨ " + Math.round(n).toLocaleString("en-PK");

/* ─── Styles ─── */
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
    --accent-mid: rgba(5,150,105,0.16);
    --red: #e11d48;
    --red-dim: rgba(225,29,72,0.07);
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

  .blocks-root * { box-sizing: border-box; }

  .blocks-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg);
    color: var(--text-primary);
    min-height: 100vh;
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
  }
  [dir="rtl"] .blocks-root { font-family: 'Noto Nastaliq Urdu', 'Plus Jakarta Sans', sans-serif; }

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
    max-width: 420px;
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

  /* ── Grid ── */
  .blocks-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  @media (max-width: 1024px) { .blocks-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px)  { .blocks-grid { grid-template-columns: 1fr; } }

  /* ── Block Card ── */
  .block-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
    text-decoration: none;
    color: inherit;
  }
  .block-card:hover {
    box-shadow: 0 2px 8px rgba(15,23,42,0.06);
    border-color: var(--border-mid);
  }

  /* top accent stripe */
  .block-card-stripe {
    height: 2px;
    background: var(--accent);
    flex-shrink: 0;
  }

  .block-card-body {
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
  }

  /* Block identity row */
  .block-identity {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .block-avatar {
    width: 38px; height: 38px;
    border-radius: 10px;
    background: var(--accent-dim);
    border: 1px solid var(--accent-mid);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
    flex-shrink: 0;
  }
  .block-name {
    font-size: 14.5px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.1px;
    line-height: 1.2;
  }
  .phase-badge {
    display: inline-flex;
    align-items: center;
    margin-top: 3px;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 99px;
    background: var(--accent-dim);
    color: var(--accent);
    letter-spacing: 0.04em;
  }

  /* Metrics 2×2 grid */
  .metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: var(--border);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .metric-cell {
    background: var(--surface-2);
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
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
    font-size: 12.5px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: -0.2px;
    line-height: 1.2;
  }
  .metric-value.green { color: var(--accent); }
  .metric-value.red   { color: var(--red); }
  .metric-value.dark  { color: var(--text-primary); }
  .metric-value.rate  { color: #2563eb; }

  /* Progress row */
  .block-progress-row {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .block-progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .progress-label {
    font-size: 9.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }
  .progress-pct {
    font-size: 11.5px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    color: var(--accent);
  }
  .progress-track {
    width: 100%;
    height: 4px;
    background: var(--surface-3);
    border-radius: 99px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 99px;
    background: var(--accent);
    transition: width 0.6s ease;
  }
  .progress-fill.warning { background: var(--amber, #d97706); }
  .progress-fill.danger  { background: var(--red); }

  /* ── States ── */
  .center-spinner { display: flex; justify-content: center; align-items: center; min-height: 260px; }
  .fade-in { animation: fadeUp 0.3s ease both; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* staggered cards */
  .block-card:nth-child(1)  { animation-delay: 0ms; }
  .block-card:nth-child(2)  { animation-delay: 40ms; }
  .block-card:nth-child(3)  { animation-delay: 80ms; }
  .block-card:nth-child(4)  { animation-delay: 120ms; }
  .block-card:nth-child(5)  { animation-delay: 160ms; }
  .block-card:nth-child(6)  { animation-delay: 200ms; }
  .block-card:nth-child(7)  { animation-delay: 240ms; }
  .block-card:nth-child(8)  { animation-delay: 280ms; }
  .block-card:nth-child(n+9) { animation-delay: 320ms; }
`;

/* ─── Helpers ─── */
function getProgressVariant(rate: number) {
  if (rate >= 70) return "";
  if (rate >= 40) return "warning";
  return "danger";
}

/* ─── Page ─── */
export default function BlocksPage() {
  const { t } = useTranslation();
  const [year, setYear] = useState(new Date().getFullYear());
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlocks = async () => {
    let active = true;
    setLoading(true);
    setError(null);
    try {
      const data = await getAllBlocks(year);
      if (active) setBlocks([...data].sort((a: any, b: any) => a.block.localeCompare(b.block)));
    } catch (err) {
      if (active) setError(err instanceof Error ? err.message : "Failed to load blocks.");
    } finally {
      if (active) setLoading(false);
    }
    return () => { active = false; };
  };

  useEffect(() => {
    fetchBlocks();
  }, [year]);

  return (
    <>
      <style>{styles}</style>
      <div className="blocks-root">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <div className="header-eyebrow">
              <div className="eyebrow-dot" />
              <span className="eyebrow-text">{t("blocks.eyebrow")}</span>
            </div>
            <h1 className="page-title">{t("blocks.title")}</h1>
            <p className="page-sub">{t("blocks.subtitle")}</p>
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
        ) : error ? (
          <ErrorBanner message={error} onRetry={fetchBlocks} />
        ) : (
          <div className="blocks-grid fade-in">
            {blocks.map((b) => {
              const variant = getProgressVariant(b.collectionRate);
              const phase = BLOCK_PHASE_MAP[b.block] || "?";
              return (
                <Link key={b.block} href={`/blocks/${b.block}`} className="block-card fade-in">
                  <div className="block-card-stripe" />

                  <div className="block-card-body">
                    <div className="block-identity">
                      <div className="block-avatar">{b.block}</div>
                      <div>
                        <div className="block-name">{t("plot.block")} {b.block}</div>
                        <span className="phase-badge">{phase}</span>
                      </div>
                    </div>

                    <div className="metrics-grid">
                      <div className="metric-cell">
                        <span className="metric-label">{t("blocks.collected")}</span>
                        <span className="metric-value green">{formatPKR(b.totalCollected)}</span>
                      </div>
                      <div className="metric-cell">
                        <span className="metric-label">{t("blocks.remaining")}</span>
                        <span className="metric-value red">{formatPKR(b.remaining)}</span>
                      </div>
                      <div className="metric-cell">
                        <span className="metric-label">{t("blocks.totalPlots")}</span>
                        <span className="metric-value dark">{b.totalPlots}</span>
                      </div>
                      <div className="metric-cell">
                        <span className="metric-label">{t("blocks.collectionRate")}</span>
                        <span className="metric-value rate">{b.collectionRate}%</span>
                      </div>
                    </div>

                    <div className="block-progress-row">
                      <div className="block-progress-header">
                        <span className="progress-label">{t("blocks.collectionProgress")}</span>
                        <span className="progress-pct">{b.collectionRate}%</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className={`progress-fill ${variant}`}
                          style={{ width: `${Math.min(100, b.collectionRate)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}