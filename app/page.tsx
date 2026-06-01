"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { RootState } from "../store";
import { getOverview, getPlotById, searchPlots } from "../services";
import Spinner from "../components/ui/Spinner";
import {
  ALL_BLOCKS,
  ALL_PHASES,
  YEARS_WITH_DATA,
  formatPKR,
} from "../constants/phases";

const MONTHS = [
  { key: "jan", label: "Jan" },
  { key: "feb", label: "Feb" },
  { key: "mar", label: "Mar" },
  { key: "apr", label: "Apr" },
  { key: "may", label: "May" },
  { key: "jun", label: "Jun" },
  { key: "jul", label: "Jul" },
  { key: "aug", label: "Aug" },
  { key: "sep", label: "Sep" },
  { key: "oct", label: "Oct" },
  { key: "nov", label: "Nov" },
  { key: "dec", label: "Dec" },
];

const BLOCKS = ALL_BLOCKS;

function getDefaultMonthRange(yearVal: string) {
  if (yearVal === "overall") return { from: "jan", to: "dec" };
  const y = parseInt(yearVal);
  const now = new Date();
  if (y === now.getFullYear()) {
    const currentMonthIdx = now.getMonth();
    return { from: "jan", to: MONTHS[currentMonthIdx].key };
  }
  return { from: "jan", to: "dec" };
}

/* ─── Inline styles (no Tailwind dependency for new design tokens) ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  :root {
    --bg: #f4f6f9;
    --surface: #ffffff;
    --surface-2: #f8fafc;
    --surface-3: #f1f5f9;
    --border: rgba(0,0,0,0.07);
    --border-bright: rgba(0,0,0,0.12);
    --accent: #059669;
    --accent-dim: rgba(5,150,105,0.08);
    --accent-glow: rgba(5,150,105,0.25);
    --red: #e11d48;
    --amber: #d97706;
    --blue: #2563eb;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #94a3b8;
    --radius: 16px;
    --radius-sm: 10px;
    --radius-xs: 6px;
  }

  .dash-root * { box-sizing: border-box; }

  .dash-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg);
    color: var(--text-primary);
    min-height: 100vh;
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
  }
  [dir="rtl"] .dash-root { font-family: 'Noto Nastaliq Urdu', 'Plus Jakarta Sans', sans-serif; }

  /* ── Hero Header ── */
  .dash-header {
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
  .header-title {
    font-size: 19px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.2px;
    line-height: 1.25;
  }
  .header-sub {
    font-size: 12.5px;
    color: var(--text-secondary);
    margin-top: 4px;
    max-width: 480px;
    line-height: 1.5;
  }

  /* ── Filter Pill Bar ── */
  .filter-bar {
    display: flex;
    align-items: center;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 4px;
    flex-wrap: wrap;
    gap: 2px;
  }
  .filter-group {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
  }
  .filter-label {
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .filter-select {
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    outline: none;
    padding: 2px 0;
  }
  .filter-select option { background: #ffffff; color: #0f172a; }
  .filter-divider {
    width: 1px; height: 16px;
    background: var(--border);
    flex-shrink: 0;
  }

  /* ── Main Grid ── */
  .dash-grid-2 {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 16px;
    margin-bottom: 16px;
  }
  .dash-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 1024px) {
    .dash-grid-2 { grid-template-columns: 1fr; }
    .dash-grid-3 { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 640px) {
    .dash-grid-3 { grid-template-columns: 1fr; }
    .dash-root { padding: 14px; }
    .dash-header { padding: 16px 18px; }
    .header-title { font-size: 17px; }
  }

  /* ── Cards ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  .card:hover { border-color: var(--border-bright); box-shadow: 0 2px 8px rgba(15,23,42,0.06); }
  .card-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-muted);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .card-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* ── Stat Cards ── */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
  @media (max-width: 900px) { .stat-grid { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 480px) { .stat-grid { grid-template-columns: 1fr; } }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 18px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  .stat-card:hover { border-color: var(--border-bright); box-shadow: 0 2px 8px rgba(15,23,42,0.06); }
  .stat-card-accent { display: none; }
  .stat-icon {
    width: 30px; height: 30px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 10px;
  }
  .stat-value {
    font-size: 19px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.3px;
    font-family: 'JetBrains Mono', monospace;
  }
  .stat-label {
    font-size: 11.5px;
    color: var(--text-secondary);
    margin-top: 2px;
    font-weight: 500;
  }
  .stat-delta {
    font-size: 10.5px;
    color: var(--text-muted);
    margin-top: 6px;
    font-weight: 500;
  }

  /* ── Pinned Plot Card ── */
  .pin-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 14px;
    gap: 10px;
  }
  .pin-badge-live {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(5,150,105,0.08);
    border: 1px solid rgba(5,150,105,0.18);
    color: var(--accent);
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 9px;
    border-radius: 99px;
  }
  .pin-badge-live span {
    width: 4px; height: 4px;
    background: var(--accent);
    border-radius: 50%;
    display: inline-block;
  }
  .pin-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.2px;
  }
  .pin-meta {
    font-size: 11.5px;
    color: var(--text-secondary);
    margin-top: 3px;
    font-weight: 500;
  }
  .pin-meta strong { color: var(--text-primary); }
  .pin-meta .phase-tag {
    color: var(--accent);
    font-weight: 700;
  }
  .btn-outline-dark {
    background: var(--surface-2);
    border: 1px solid var(--border-bright);
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: var(--radius-xs);
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .btn-outline-dark:hover { background: var(--surface-3); color: var(--text-primary); border-color: rgba(0,0,0,0.2); }

  /* month grid */
  .month-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }
  @media (max-width: 600px) { .month-grid { grid-template-columns: repeat(3, 1fr); } }
  .month-cell {
    border-radius: var(--radius-xs);
    padding: 8px 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .month-cell.paid {
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.2);
  }
  .month-cell.unpaid {
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
  }
  .month-key {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
  }
  .month-cell.paid .month-key { color: var(--accent); }
  .month-val {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-secondary);
    font-family: 'JetBrains Mono', monospace;
  }
  .month-cell.paid .month-val { color: #d1fae5; }

  /* summary strip */
  .summary-strip {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .strip-pill {
    background: rgba(16,185,129,0.12);
    border: 1px solid rgba(16,185,129,0.2);
    color: var(--accent);
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 99px;
  }
  .strip-stat { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
  .strip-stat strong { font-weight: 700; }
  .strip-stat .green { color: var(--accent); }
  .strip-stat .red { color: var(--red); }

  /* ── Empty pin state ── */
  .pin-empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 20px;
    padding: 8px 4px;
    height: 100%;
  }
  @media (min-width: 640px) {
    .pin-empty { flex-direction: row; align-items: center; justify-content: space-between; }
  }
  .pin-empty-icon {
    width: 36px; height: 36px;
    background: var(--accent-dim);
    border: 1px solid rgba(5,150,105,0.18);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    margin-bottom: 8px;
  }
  .pin-empty h3 {
    font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px;
  }
  .pin-empty p {
    font-size: 12.5px; color: var(--text-secondary); max-width: 320px; line-height: 1.5; margin: 0;
  }
  .pin-form { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
  .pin-form-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .form-select, .form-input {
    background: #fff;
    border: 1px solid var(--border-bright);
    color: var(--text-primary);
    font-family: inherit;
    font-size: 12.5px;
    font-weight: 500;
    padding: 8px 11px;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .form-select:focus, .form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(5,150,105,0.12); }
  .form-input { width: 140px; }
  .form-input::placeholder { color: var(--text-muted); font-weight: 400; }
  .form-select option { background: #ffffff; color: #0f172a; }
  .btn-primary {
    background: var(--accent);
    color: #fff;
    font-family: inherit;
    font-size: 12.5px;
    font-weight: 600;
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .btn-primary:hover { background: #047857; }
  .pin-error { font-size: 11px; color: var(--red); font-weight: 600; }

  /* ── Filters Card ── */
  .filter-section-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin-bottom: 8px;
  }
  .phase-btn {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 6px;
    border: 1px solid var(--border-bright);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    margin: 0 3px 6px 0;
  }
  .phase-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
  .phase-btn.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
  .block-btn {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    padding: 4px 9px;
    border-radius: 5px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    margin: 0 3px 4px 0;
  }
  .block-btn:hover { border-color: var(--border-bright); color: var(--text-secondary); }
  .block-btn.active { background: var(--accent-dim); border-color: rgba(16,185,129,0.4); color: var(--accent); }
  .block-scroll { max-height: 100px; overflow-y: auto; }
  .block-scroll::-webkit-scrollbar { width: 3px; }
  .block-scroll::-webkit-scrollbar-track { background: transparent; }
  .block-scroll::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 3px; }

  /* ── Charts ── */
  .chart-row {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 16px;
    margin-bottom: 16px;
  }
  .chart-row.full { grid-template-columns: 1fr; }
  @media (max-width: 960px) { .chart-row { grid-template-columns: 1fr; } }

  /* progress rows */
  .block-row { margin-bottom: 14px; }
  .block-row-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 5px;
  }
  .block-row-name {
    font-size: 12px; font-weight: 700; color: var(--text-primary);
  }
  .block-row-phase { font-size: 11px; color: var(--text-muted); font-weight: 500; }
  .block-row-rate {
    font-size: 13px; font-weight: 800; color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
  }
  .progress-track {
    width: 100%;
    height: 5px;
    background: #e2e8f0;
    border-radius: 99px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #059669, #10b981);
    border-radius: 99px;
    transition: width 0.6s ease;
  }
  .block-row-meta { font-size: 10px; color: var(--text-muted); font-weight: 500; margin-top: 4px; }
  .block-scroll-wrap { overflow-y: auto; max-height: 300px; padding-right: 6px; }
  .block-scroll-wrap::-webkit-scrollbar { width: 3px; }
  .block-scroll-wrap::-webkit-scrollbar-track { background: transparent; }
  .block-scroll-wrap::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 3px; }

  /* overall 3 col grid */
  .block-overall-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px 20px;
    max-height: 380px;
    overflow-y: auto;
    padding-right: 4px;
  }
  @media (max-width: 900px) { .block-overall-grid { grid-template-columns: repeat(2,1fr); } }

  /* tooltip overrides */
  .recharts-tooltip-wrapper .recharts-default-tooltip {
    background: var(--surface-2) !important;
    border-color: var(--border-bright) !important;
    border-radius: 10px !important;
  }

  /* status badge */
  .status-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 99px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .status-green { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); color: var(--accent); }
  .status-red { background: rgba(244,63,94,0.12); border: 1px solid rgba(244,63,94,0.25); color: var(--red); }

  /* spinner wrapper */
  .center-spinner { display: flex; justify-content: center; align-items: center; min-height: 180px; }

  .fade-in { animation: fadeUp 0.35s ease both; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

/* ─── Sub-components ─── */
function StatItem({
  icon,
  label,
  value,
  delta,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delta: string;
  accentColor: string;
}) {
  return (
    <div className="stat-card fade-in">
      <div className="stat-card-accent" style={{ background: accentColor }} />
      <div className="stat-icon" style={{ background: `${accentColor}18` }}>
        {icon}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-delta">{delta}</div>
    </div>
  );
}

function BlockProgressRow({ row }: { row: any }) {
  return (
    <div className="block-row">
      <div className="block-row-header">
        <div>
          <span className="block-row-name">Block {row.block}</span>
          <span className="block-row-phase"> · {row.phase}</span>
        </div>
        <span className="block-row-rate">{row.collectionRate}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${row.collectionRate}%` }} />
      </div>
      <div className="block-row-meta">
        {row.totalPlots} plots · {row.paidCount} paid · {row.defaulterCount} defaulters
      </div>
    </div>
  );
}

/* ─── Custom Tooltip ─── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid rgba(0,0,0,0.1)",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 12,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: "#0f172a",
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, textTransform: "uppercase", fontSize: 10, color: "#94a3b8", letterSpacing: "0.07em" }}>
        {String(label).toUpperCase()}
      </div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.fill, display: "inline-block" }} />
          <span style={{ color: "#64748b" }}>{p.name}:</span>
          <span style={{ fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: "#0f172a" }}>{formatPKR(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Page ─── */
export default function UserOverviewPage() {
  const { t } = useTranslation();
  const resident = useSelector((s: RootState) => s.auth.resident);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<string>(String(currentYear));
  const defaultRange = getDefaultMonthRange(String(currentYear));
  const [monthFrom, setMonthFrom] = useState(defaultRange.from);
  const [monthTo, setMonthTo] = useState(defaultRange.to);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pinnedPlotId, setPinnedPlotId] = useState<string | null>(null);
  const [pinnedPlotData, setPinnedPlotData] = useState<any>(null);
  const [loadingPinned, setLoadingPinned] = useState(false);

  const [pinBlock, setPinBlock] = useState("A");
  const [pinNumber, setPinNumber] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  const isOverall = year === "overall";

  // For a signed-in resident, always pin THEIR plot — the manual pin search
  // below is hidden in that case (they can only have one plot anyway).
  useEffect(() => {
    if (resident?.id) {
      setPinnedPlotId(resident.id);
      return;
    }
    const saved = localStorage.getItem("kkb4_pinned_plot_id");
    if (saved) setPinnedPlotId(saved);
  }, [resident?.id]);

  useEffect(() => {
    const range = getDefaultMonthRange(year);
    setMonthFrom(range.from);
    setMonthTo(range.to);
  }, [year]);

  useEffect(() => {
    if (!pinnedPlotId) { setPinnedPlotData(null); return; }
    const fetchPinnedPlot = async () => {
      setLoadingPinned(true);
      try {
        const data = await getPlotById(pinnedPlotId);
        setPinnedPlotData(data);
      } catch { console.error("Failed to fetch pinned plot"); }
      finally { setLoadingPinned(false); }
    };
    fetchPinnedPlot();
  }, [pinnedPlotId, year]);

  useEffect(() => {
    let active = true;
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getOverview({
          year,
          monthFrom: isOverall ? undefined : monthFrom,
          monthTo: isOverall ? undefined : monthTo,
          phase: selectedPhase || undefined,
          block: selectedBlock || undefined,
        });
        if (active) setData(result);
      } catch { if (active) setError(t("dashboard.couldNotLoad")); }
      finally { if (active) setLoading(false); }
    };
    fetchAnalytics();
    return () => { active = false; };
  }, [year, monthFrom, monthTo, selectedPhase, selectedBlock, isOverall, t]);

  const handlePhaseChange = (phase: string | null) => { setSelectedBlock(null); setSelectedPhase(phase); };
  const handleBlockChange = (block: string | null) => { setSelectedPhase(null); setSelectedBlock(block); };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    if (!pinNumber.trim()) { setPinError(t("errors.enterPlotNumber")); return; }
    try {
      const plots = await searchPlots(pinBlock, pinNumber.trim());
      if (plots) {
        const exactMatch = plots.find(
          (p: any) =>
            p.plotNumber.toString().trim() === pinNumber.trim() &&
            p.block.toUpperCase() === pinBlock.toUpperCase()
        );
        if (exactMatch) {
          localStorage.setItem("kkb4_pinned_plot_id", exactMatch._id);
          setPinnedPlotId(exactMatch._id);
          setPinNumber("");
        } else {
          setPinError(t("errors.plotNotFound", { plot: pinNumber, block: pinBlock }));
        }
      }
    } catch { setPinError(t("errors.verificationFailed")); }
  };

  const handleUnpin = () => {
    localStorage.removeItem("kkb4_pinned_plot_id");
    setPinnedPlotId(null);
    setPinnedPlotData(null);
  };

  const displayYear = isOverall ? t("common.allYears") : year;

  return (
    <>
      <style>{styles}</style>
      <div className="dash-root">

        {/* ── Header ── */}
        <div className="dash-header">
          <div>
            <div className="header-eyebrow">
              <div className="eyebrow-dot" />
              <span className="eyebrow-text">{t("dashboard.eyebrow")}</span>
            </div>
            <h1 className="header-title">{t("dashboard.title")}</h1>
            <p className="header-sub">{t("dashboard.subtitle")}</p>
          </div>

          <div className="filter-bar">
            <div className="filter-group">
              <span className="filter-label">{t("common.year")}</span>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="filter-select"
              >
                <option value="overall">{t("common.overall")}</option>
                {[...YEARS_WITH_DATA].reverse().map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>

            {!isOverall && (
              <>
                <div className="filter-divider" />
                <div className="filter-group">
                  <span className="filter-label">{t("common.from")}</span>
                  <select value={monthFrom} onChange={(e) => setMonthFrom(e.target.value)} className="filter-select">
                    {MONTHS.map((m) => <option key={m.key} value={m.key}>{t(`months.short.${m.key}`)}</option>)}
                  </select>
                </div>
                <div className="filter-divider" />
                <div className="filter-group">
                  <span className="filter-label">{t("common.to")}</span>
                  <select value={monthTo} onChange={(e) => setMonthTo(e.target.value)} className="filter-select">
                    {MONTHS.map((m) => <option key={m.key} value={m.key}>{t(`months.short.${m.key}`)}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Pinned Plot + Filters Row ── */}
        <div className="dash-grid-2" style={{ marginBottom: 20 }}>

          {/* Pinned Plot Card */}
          <div className="card">
            {pinnedPlotId ? (
              loadingPinned || !pinnedPlotData ? (
                <div className="center-spinner"><Spinner size={32} /></div>
              ) : (
                <div className="fade-in">
                  <div className="pin-header">
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <span className="pin-badge-live"><span />{t("dashboard.pinnedPlot")}</span>
                      </div>
                      <div className="pin-title">
                        {pinnedPlotData.plotCode || pinnedPlotData.plotBlock}
                      </div>
                      <div className="pin-meta">
                        {t("dashboard.registeredOwner")}:{" "}
                        <strong>{pinnedPlotData.ownerName}</strong>
                        {" · "}
                        <span className="phase-tag">{pinnedPlotData.phase}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span className={`status-badge ${pinnedPlotData.allotmentStatus === "Active" ? "status-green" : "status-red"}`}>
                        {pinnedPlotData.allotmentStatus}
                      </span>
                      {!resident && (
                        <button onClick={handleUnpin} className="btn-outline-dark">{t("dashboard.change")}</button>
                      )}
                    </div>
                  </div>

                  {!isOverall && (() => {
                    const numYear = parseInt(year);
                    const payRecord = pinnedPlotData.payments?.find((p: any) => p.year === numYear);
                    const received = payRecord?.totalReceived || 0;
                    const expected = payRecord?.totalDue || 4800;
                    const remaining = Math.max(0, expected - received);
                    const paidCount = MONTHS.filter((m) => payRecord?.payments?.[m.key] > 0).length;

                    return (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span style={{ fontSize: 9.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
                            {t("dashboard.paymentCalendar")} — {year}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", fontFamily: "JetBrains Mono, monospace" }}>
                            {payRecord ? formatPKR(payRecord.mcRate) : "₨ 400"}{t("dashboard.perMonth")}
                          </span>
                        </div>

                        <div className="month-grid">
                          {MONTHS.map((m) => {
                            const val = payRecord?.payments?.[m.key];
                            const isPaid = val !== null && val !== undefined && val > 0;
                            return (
                              <div key={m.key} className={`month-cell ${isPaid ? "paid" : "unpaid"}`}>
                                <span className="month-key">{t(`months.short.${m.key}`)}</span>
                                <span className="month-val">{isPaid ? formatPKR(val) : "—"}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="summary-strip">
                          <span className="strip-pill">{paidCount} / 12 {t("dashboard.monthsPaid")}</span>
                          <div style={{ display: "flex", gap: 20 }}>
                            <span className="strip-stat">
                              {t("dashboard.received")}: <strong className="green">{formatPKR(received)}</strong>
                            </span>
                            <span className="strip-stat">
                              {t("blocks.remaining")}: <strong className="red">{formatPKR(remaining)}</strong>
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )
            ) : resident ? (
              // Resident is signed in but pinnedPlotData hasn't arrived yet —
              // show a spinner instead of the manual-pin fallback so the wrong
              // affordance never flashes.
              <div className="center-spinner"><Spinner size={32} /></div>
            ) : (
              <div className="pin-empty">
                <div>
                  <div className="pin-empty-icon">🏠</div>
                  <h3>{t("dashboard.areYouOwner")}</h3>
                  <p>{t("dashboard.pinDescription")}</p>
                </div>
                <form onSubmit={handlePinSubmit} className="pin-form">
                  <div className="pin-form-row">
                    <select value={pinBlock} onChange={(e) => setPinBlock(e.target.value)} className="form-select">
                      {BLOCKS.map((b) => <option key={b} value={b}>{t("plot.block")} {b}</option>)}
                    </select>
                    <input
                      type="text"
                      value={pinNumber}
                      onChange={(e) => setPinNumber(e.target.value)}
                      placeholder={t("dashboard.plotPlaceholder")}
                      className="form-input"
                      dir="ltr"
                    />
                    <button type="submit" className="btn-primary">{t("dashboard.verifyAndPin")}</button>
                  </div>
                  {pinError && <span className="pin-error">{pinError}</span>}
                </form>
              </div>
            )}
          </div>

          {/* Filters Card */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card-title">{t("dashboard.societyFilters")}</div>

            <div>
              <div className="filter-section-label">{t("nav.phases")}</div>
              <div>
                <button
                  onClick={() => handlePhaseChange(null)}
                  className={`phase-btn ${selectedPhase === null && selectedBlock === null ? "active" : ""}`}
                >
                  {t("common.all")}
                </button>
                {ALL_PHASES.map((ph) => (
                  <button
                    key={ph}
                    onClick={() => handlePhaseChange(ph)}
                    className={`phase-btn ${selectedPhase === ph ? "active" : ""}`}
                  >
                    {ph}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="filter-section-label">{t("nav.blocks")}</div>
              <div className="block-scroll">
                {BLOCKS.map((b) => (
                  <button
                    key={b}
                    onClick={() => handleBlockChange(b)}
                    className={`block-btn ${selectedBlock === b ? "active" : ""}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Analytics ── */}
        {loading ? (
          <div className="center-spinner"><Spinner /></div>
        ) : error ? (
          <div style={{
            background: "rgba(225,29,72,0.06)",
            border: "1px solid rgba(225,29,72,0.18)",
            borderRadius: 12,
            padding: "16px 20px",
            color: "var(--red)",
            fontSize: 13,
            fontWeight: 600,
            textAlign: "center",
          }}>
            {error}
          </div>
        ) : (
          <div className="fade-in">
            {/* Stat Cards */}
            <div className="stat-grid">
              <StatItem
                icon={<svg width="16" height="16" fill="none" stroke="#3b82f6" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" /></svg>}
                label={t("dashboard.totalPlots")}
                value={data.totalPlots}
                delta={`${data.activePlots} ${t("status.active")}`}
                accentColor="#3b82f6"
              />
              <StatItem
                icon={<svg width="16" height="16" fill="none" stroke="#f59e0b" strokeWidth="1.6" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v2m0 6v2M9.5 9.5C9.5 8.67 10.67 8 12 8s2.5.67 2.5 1.5S13.33 11 12 11s-2.5.67-2.5 1.5S10.67 16 12 16s2.5-.67 2.5-1.5" /></svg>}
                label={t("dashboard.collectionRate")}
                value={`${data.collectionRate}%`}
                delta={t("dashboard.overallProgress")}
                accentColor="#f59e0b"
              />
              <StatItem
                icon={<svg width="16" height="16" fill="none" stroke="#10b981" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                label={t("dashboard.totalCollected")}
                value={formatPKR(data.totalReceived)}
                delta={`${t("dashboard.target")}: ${formatPKR(data.totalDue)}`}
                accentColor="#10b981"
              />
              <StatItem
                icon={<svg width="16" height="16" fill="none" stroke="#f43f5e" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                label={t("dashboard.totalRemaining")}
                value={formatPKR(data.totalRemaining)}
                delta={t("dashboard.pendingDues")}
                accentColor="#f43f5e"
              />
            </div>

            {/* Chart Row */}
            <div className={`chart-row ${isOverall ? "full" : ""}`}>
              {!isOverall && data.perMonthBreakdown?.length > 0 && (
                <div className="card">
                  <div className="card-title">{t("dashboard.expectedVsReceived")} — {displayYear}</div>
                  <div style={{ width: "100%", height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.perMonthBreakdown} barCategoryGap="28%" barGap={4}>
                        <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,0,0,0.05)" vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(m) => m.toUpperCase()}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `${(v / 1_000).toFixed(0)}K`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                        <Legend
                          verticalAlign="top"
                          height={32}
                          wrapperStyle={{ fontSize: 11, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#94a3b8" }}
                        />
                        <Bar dataKey="due" fill="#e2e8f0" radius={[4, 4, 0, 0]} name={t("dashboard.expected")} />
                        <Bar dataKey="received" fill="#10b981" radius={[4, 4, 0, 0]} name={t("dashboard.received")} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Block Rates */}
              <div className="card">
                <div className="card-title">{t("dashboard.blockCollectionRates")} — {displayYear}</div>
                {isOverall ? (
                  <div className="block-overall-grid">
                    {data.perBlockBreakdown.map((row: any) => (
                      <BlockProgressRow key={row.block} row={row} />
                    ))}
                  </div>
                ) : (
                  <div className="block-scroll-wrap">
                    {data.perBlockBreakdown.map((row: any) => (
                      <BlockProgressRow key={row.block} row={row} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}