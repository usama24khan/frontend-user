"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../utils/api";
import ProgressBar from "../../components/ui/ProgressBar";
import Spinner from "../../components/ui/Spinner";
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
    padding: 28px;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* ── Page Header ── */
  .page-header {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 24px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 24px;
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
  }
  .page-header::before {
    content: '';
    position: absolute;
    top: -50px; left: -50px;
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(5,150,105,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .page-header::after {
    content: '';
    position: absolute;
    bottom: -40px; right: 80px;
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%);
    pointer-events: none;
  }
  .header-eyebrow {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 6px;
  }
  .eyebrow-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 6px rgba(5,150,105,0.4);
    animation: pulseDot 2s ease infinite;
  }
  @keyframes pulseDot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.75); }
  }
  .eyebrow-text {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .page-title {
    font-size: 24px;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.4px;
    line-height: 1.1;
    position: relative;
  }
  .page-sub {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 4px;
    font-weight: 500;
    max-width: 420px;
    position: relative;
  }

  /* ── Year Selector ── */
  .year-selector {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--surface-2);
    border: 1px solid var(--border-mid);
    border-radius: var(--radius);
    padding: 8px 14px;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  .year-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }
  .year-select {
    background: transparent;
    border: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    font-weight: 800;
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
    gap: 18px;
  }
  @media (max-width: 1024px) { .blocks-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px)  { .blocks-grid { grid-template-columns: 1fr; } }

  /* ── Block Card ── */
  .block-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow: hidden;
    transition: box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
    text-decoration: none;
    color: inherit;
    position: relative;
  }
  .block-card:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--border-mid);
    transform: translateY(-2px);
  }

  /* top accent stripe */
  .block-card-stripe {
    height: 3px;
    background: linear-gradient(90deg, #34d399, var(--accent));
    flex-shrink: 0;
  }

  .block-card-body {
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    flex: 1;
  }

  /* Block identity row */
  .block-identity {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .block-avatar {
    width: 46px; height: 46px;
    border-radius: 13px;
    background: var(--accent-dim);
    border: 1px solid var(--accent-mid);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    font-weight: 800;
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
    flex-shrink: 0;
  }
  .block-name {
    font-size: 16px;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.2px;
    line-height: 1.2;
  }
  .phase-badge {
    display: inline-flex;
    align-items: center;
    margin-top: 4px;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 9px;
    border-radius: 99px;
    background: var(--accent-dim);
    border: 1px solid var(--accent-mid);
    color: var(--accent);
    letter-spacing: 0.04em;
  }

  /* Metrics 2×2 grid */
  .metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    background: var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .metric-cell {
    background: var(--surface-2);
    padding: 11px 13px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .metric-cell:hover { background: var(--surface-3); }
  .metric-label {
    font-size: 9.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-muted);
  }
  .metric-value {
    font-size: 13px;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: -0.3px;
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
    gap: 6px;
  }
  .block-progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .progress-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
  }
  .progress-pct {
    font-size: 12px;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
    color: var(--accent);
  }
  .progress-track {
    width: 100%;
    height: 5px;
    background: var(--surface-3);
    border-radius: 99px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, #34d399, var(--accent));
    transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .progress-fill.warning { background: linear-gradient(90deg, #fcd34d, #d97706); }
  .progress-fill.danger  { background: linear-gradient(90deg, #fb7185, var(--red)); }

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
  const [year, setYear] = useState(new Date().getFullYear());
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchBlocks = async () => {
      setLoading(true);
      try {
        const res: any = await api.get(`/blocks?year=${year}`);
        if (active && res.success) {
          setBlocks([...res.data].sort((a: any, b: any) => a.block.localeCompare(b.block)));
        }
      } catch (err) {
        console.error("Failed to fetch blocks:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchBlocks();
    return () => { active = false; };
  }, [year]);

  return (
    <>
      <style>{styles}</style>
      <div className="blocks-root">

        {/* ── Header ── */}
        <div className="page-header">
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="header-eyebrow">
              <div className="eyebrow-dot" />
              <span className="eyebrow-text">Block Directory</span>
            </div>
            <h1 className="page-title">Blocks Overview</h1>
            <p className="page-sub">
              Browse recovery metrics, property counts, and collection rates across all blocks.
            </p>
          </div>

          <div className="year-selector">
            <span className="year-label">Year</span>
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
          <div className="blocks-grid fade-in">
            {blocks.map((b) => {
              const variant = getProgressVariant(b.collectionRate);
              const phase = BLOCK_PHASE_MAP[b.block] || "?";
              return (
                <Link key={b.block} href={`/blocks/${b.block}`} className="block-card fade-in">
                  {/* Accent stripe */}
                  <div className="block-card-stripe" />

                  <div className="block-card-body">
                    {/* Identity */}
                    <div className="block-identity">
                      <div className="block-avatar">{b.block}</div>
                      <div>
                        <div className="block-name">Block {b.block}</div>
                        <span className="phase-badge">{phase}</span>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="metrics-grid">
                      <div className="metric-cell">
                        <span className="metric-label">Collected</span>
                        <span className="metric-value green">{formatPKR(b.totalCollected)}</span>
                      </div>
                      <div className="metric-cell">
                        <span className="metric-label">Remaining</span>
                        <span className="metric-value red">{formatPKR(b.remaining)}</span>
                      </div>
                      <div className="metric-cell">
                        <span className="metric-label">Total Plots</span>
                        <span className="metric-value dark">{b.totalPlots}</span>
                      </div>
                      <div className="metric-cell">
                        <span className="metric-label">Collection Rate</span>
                        <span className="metric-value rate">{b.collectionRate}%</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="block-progress-row">
                      <div className="block-progress-header">
                        <span className="progress-label">Collection Progress</span>
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