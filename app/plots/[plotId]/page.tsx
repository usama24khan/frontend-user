"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "../../../store";
import { getPlotById } from "../../../services";
import Spinner from "../../../components/ui/Spinner";
import { YEARS_WITH_DATA } from "../../../constants/phases";

const formatPKR = (n: number) => "₨ " + Math.round(n).toLocaleString("en-PK");

const MONTH_KEYS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

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
    --amber: #d97706;
    --amber-dim: rgba(217,119,6,0.08);
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

  .pd-root * { box-sizing: border-box; }

  .pd-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg);
    color: var(--text-primary);
    min-height: 100vh;
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
  }
  [dir="rtl"] .pd-root { font-family: 'Noto Nastaliq Urdu', 'Plus Jakarta Sans', sans-serif; }

  /* ── Hero Header ── */
  .pd-header {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 14px;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  .pd-header-info { flex: 1; min-width: 0; }
  .pd-badges {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .pd-pill {
    display: inline-flex;
    align-items: center;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 3px 9px;
    border-radius: 99px;
    border: 1px solid;
  }
  .pill-plot {
    background: var(--accent-dim);
    color: var(--accent);
    border-color: var(--accent-mid);
    font-family: 'JetBrains Mono', monospace;
  }
  .pill-info {
    background: var(--surface-3);
    color: var(--text-secondary);
    border-color: var(--border-mid);
  }
  .pill-active {
    background: var(--accent-dim);
    color: var(--accent);
    border-color: var(--accent-mid);
  }
  .pill-red {
    background: var(--red-dim);
    color: var(--red);
    border-color: rgba(225,29,72,0.2);
  }
  .pd-title {
    font-size: 19px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.2px;
    line-height: 1.25;
  }
  .pd-sub {
    font-size: 12.5px;
    color: var(--text-secondary);
    margin-top: 4px;
    font-weight: 500;
    max-width: 480px;
  }

  /* Lifetime card */
  .lifetime-card {
    background: var(--surface-2);
    border: 1px solid var(--border-mid);
    border-radius: 10px;
    padding: 10px 16px;
    flex-shrink: 0;
    min-width: 180px;
  }
  .lifetime-label {
    font-size: 9.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
    margin-bottom: 3px;
  }
  .lifetime-value {
    font-size: 18px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    color: var(--accent);
    letter-spacing: -0.3px;
  }

  /* ── Control Bar ── */
  .controls-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }
  .year-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 1px solid var(--border-mid);
    border-radius: 8px;
    padding: 6px 12px;
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

  .toggle-btn {
    background: #fff;
    border: 1px solid var(--border-mid);
    color: var(--text-secondary);
    font-size: 11.5px;
    font-weight: 600;
    padding: 7px 13px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.12s;
    font-family: inherit;
  }
  .toggle-btn:hover { background: var(--surface-2); color: var(--text-primary); }
  .toggle-btn.active {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }

  /* ── Detail Card ── */
  .detail-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
    margin-bottom: 14px;
  }
  .detail-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 14px;
    flex-wrap: wrap;
    gap: 10px;
  }
  .card-title-label {
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }
  .rate-pill {
    font-size: 10.5px;
    font-weight: 700;
    color: var(--accent);
    background: var(--accent-dim);
    padding: 4px 10px;
    border-radius: 8px;
    font-family: 'JetBrains Mono', monospace;
    border: 1px solid var(--accent-mid);
  }

  /* Month grid */
  .month-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }
  @media (max-width: 700px) { .month-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 380px) { .month-grid { grid-template-columns: repeat(2, 1fr); } }

  .month-cell {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    transition: background 0.12s;
  }
  .month-cell.paid {
    background: rgba(5,150,105,0.07);
    border-color: var(--accent-mid);
  }
  .month-cell.partial {
    background: var(--amber-dim);
    border-color: rgba(217,119,6,0.18);
  }
  .month-key {
    font-size: 9.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }
  .month-cell.paid .month-key { color: var(--accent); }
  .month-cell.partial .month-key { color: var(--amber); }
  .month-val {
    font-size: 10.5px;
    font-weight: 700;
    color: var(--text-secondary);
    font-family: 'JetBrains Mono', monospace;
  }
  .month-cell.paid .month-val { color: var(--accent); }
  .month-cell.partial .month-val { color: var(--amber); }

  /* Financials grid */
  .fin-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border);
    margin-bottom: 14px;
  }
  @media (max-width: 600px) { .fin-grid { grid-template-columns: 1fr; } }
  .fin-cell {
    background: var(--surface-2);
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .fin-label {
    font-size: 9.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }
  .fin-value {
    font-size: 14.5px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: -0.2px;
  }
  .fin-value.green { color: var(--accent); }
  .fin-value.red { color: var(--red); }
  .fin-value.dark { color: var(--text-primary); }

  /* Progress */
  .progress-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .progress-section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .progress-section-label {
    font-size: 9.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }
  .progress-section-pct {
    font-size: 11.5px;
    font-weight: 700;
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
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
    background: var(--accent);
    border-radius: 99px;
    transition: width 0.6s ease;
  }

  /* ── History Table ── */
  .history-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  .history-card-head {
    padding: 12px 18px;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .history-title {
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }
  .history-table {
    width: 100%;
    border-collapse: collapse;
  }
  .history-table th {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    padding: 10px 18px;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }
  .history-table th.right { text-align: right; }
  .history-table tbody tr {
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.12s;
  }
  .history-table tbody tr:last-child { border-bottom: none; }
  .history-table tbody tr:hover { background: var(--surface-2); }
  .history-table td {
    padding: 11px 18px;
    font-size: 12.5px;
    color: var(--text-secondary);
    font-family: 'JetBrains Mono', monospace;
  }
  .history-table td.right { text-align: right; }
  .history-table td.year-cell {
    font-weight: 800;
    color: var(--text-primary);
  }
  .history-table td.green { color: var(--accent); font-weight: 700; }
  .history-table td.red { color: var(--red); font-weight: 700; }

  .pct-badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 99px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.03em;
  }
  .pct-green { background: var(--accent-dim); color: var(--accent); border: 1px solid var(--accent-mid); }
  .pct-amber { background: var(--amber-dim); color: var(--amber); border: 1px solid rgba(217,119,6,0.2); }
  .pct-red   { background: var(--red-dim); color: var(--red); border: 1px solid rgba(225,29,72,0.2); }

  /* Empty / Not found */
  .empty-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 60px 24px;
    text-align: center;
    box-shadow: var(--shadow-sm);
  }
  .empty-icon { font-size: 34px; margin-bottom: 14px; }
  .empty-text { font-size: 14px; font-weight: 600; color: var(--text-muted); }

  .center-spinner { display: flex; justify-content: center; align-items: center; min-height: 280px; }

  .fade-in { animation: fadeUp 0.3s ease both; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 640px) {
    .pd-root { padding: 16px; }
    .pd-header { padding: 18px 20px; }
    .pd-title { font-size: 21px; }
    .lifetime-card { min-width: 0; width: 100%; }
    .detail-card { padding: 18px; }
  }

  /* Print button */
  .pd-print-btn {
    display: inline-flex; align-items: center; gap: 6px;
    height: 36px; padding: 0 14px; border-radius: 10px;
    border: 1.5px solid #d1fae5;
    background: #ecfdf5; color: #065f46;
    font-size: 12.5px; font-weight: 700; cursor: pointer;
    transition: background 140ms, border-color 140ms;
  }
  .pd-print-btn:hover { background: #d1fae5; border-color: #6ee7b7; }

  /* Print stylesheet — strips layout chrome and prints the payment file. */
  @media print {
    /* Reset page background */
    body { background: #fff !important; }

    /* Hide layout chrome from AppShell (Navbar + Sidebar). They use <header>
       and <aside> respectively, so target by semantic element rather than
       class names we don't fully own. */
    header, aside { display: none !important; }

    /* Remove left padding the AppShell applied to make room for the sidebar. */
    main, body > div, main > div { padding-left: 0 !important; }

    /* Strip our own UI affordances that aren't payment data. */
    .controls-bar,
    .pd-print-btn,
    .toggle-btn,
    .year-selector { display: none !important; }

    /* Make the printed surface look like paper, not a card overlay. */
    .pd-root { padding: 0; max-width: 100%; }
    .pd-header, .detail-card, .lifetime-card {
      box-shadow: none !important;
      border-color: #ccc !important;
      page-break-inside: avoid;
    }
    .pd-header { margin-bottom: 8px; }

    /* Allow long year-by-year sections to break across pages nicely. */
    .detail-card { page-break-inside: auto; margin-bottom: 12px; }

    /* Crisper colors on paper. */
    .month-cell.paid { background: #f0fdf4 !important; border-color: #86efac !important; }
    .month-cell.partial { background: #fffbeb !important; border-color: #fde68a !important; }
    .month-cell { background: #fff !important; }
  }
`;

export default function PlotDetailPage() {
  const { t } = useTranslation();
  const { plotId } = useParams();
  const router = useRouter();
  const resident = useSelector((s: RootState) => s.auth.resident);
  const currentYear = new Date().getFullYear();
  const [plot, setPlot] = useState<any>(null);
  const [year, setYear] = useState(currentYear);
  const [allYears, setAllYears] = useState(false);
  const [loading, setLoading] = useState(true);

  // Residents may only view their own plot. Any other plotId in the URL is
  // redirected to /plots/[their-id] so they can't browse others' dues.
  const targetPlotId = plotId as string | undefined;
  const isOwnPlot = !!resident && resident.id === targetPlotId;

  useEffect(() => {
    if (!resident || !targetPlotId) return;
    if (!isOwnPlot) {
      router.replace(`/plots/${resident.id}`);
    }
  }, [resident, targetPlotId, isOwnPlot, router]);

  useEffect(() => {
    let active = true;
    const fetchPlot = async () => {
      setLoading(true);
      try {
        const data = await getPlotById(targetPlotId as string);
        if (active) setPlot(data);
      } catch (err) {
        console.error("Failed to fetch plot detail:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    // Skip the fetch when we're about to redirect to avoid flashing other plot data.
    if (targetPlotId && isOwnPlot) fetchPlot();
    return () => { active = false; };
  }, [targetPlotId, isOwnPlot]);

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="pd-root">
          <div className="center-spinner"><Spinner /></div>
        </div>
      </>
    );
  }

  if (!plot) {
    return (
      <>
        <style>{styles}</style>
        <div className="pd-root">
          <div className="empty-card">
            <div className="empty-icon">🏚️</div>
            <p className="empty-text">{t("plot.notFound")}</p>
          </div>
        </div>
      </>
    );
  }

  const payments = plot.payments || [];
  const sel = payments.find((p: any) => p.year === year);
  const totPaid = payments.reduce((s: number, p: any) => s + (p.totalReceived || 0), 0);
  const isActive = plot.allotmentStatus === "Active";

  return (
    <>
      <style>{styles}</style>
      <div className="pd-root fade-in">

        {/* ── Header ── */}
        <div className="pd-header">
          <div className="pd-header-info">
            <div className="pd-badges">
              <span className="pd-pill pill-plot">{plot.plotBlock}</span>
              <span className="pd-pill pill-info">
                {t("plot.block")} {plot.block} · {t("plot.phase")} {plot.phase}
              </span>
              <span className={`pd-pill ${isActive ? "pill-active" : "pill-red"}`}>
                {plot.allotmentStatus}
              </span>
            </div>
            <h1 className="pd-title">{plot.ownerName}</h1>
            <p className="pd-sub">{t("plot.fileSubtitle")}</p>
          </div>

          <div className="lifetime-card">
            <div className="lifetime-label">{t("plot.lifetimePaid")}</div>
            <div className="lifetime-value">{formatPKR(totPaid)}</div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="controls-bar">
          {!allYears && (
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
          )}

          <button
            onClick={() => setAllYears(!allYears)}
            className={`toggle-btn ${allYears ? "active" : ""}`}
          >
            {allYears ? `✓ ${t("common.showingAllHistory")}` : t("common.viewFullHistory")}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="pd-print-btn"
            title={t("plot.printHistoryHint")}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            {t("plot.printHistory")}
          </button>
        </div>

        {/* ── Single Year ── */}
        {!allYears && (
          sel ? (
            <div className="detail-card">
              <div className="detail-card-head">
                <span className="card-title-label">
                  {t("plot.monthlyPaymentCalendar")} — {year}
                </span>
                <span className="rate-pill">
                  {t("plot.rate")}: {formatPKR(sel.mcRate)}{t("dashboard.perMonth")}
                </span>
              </div>

              <div className="month-grid">
                {MONTH_KEYS.map((mk) => {
                  const val = sel.payments?.[mk] || 0;
                  const isPaid = val > 0;
                  const isFull = val >= sel.mcRate;
                  return (
                    <div
                      key={mk}
                      className={`month-cell ${isFull ? "paid" : isPaid ? "partial" : ""}`}
                    >
                      <span className="month-key">{t(`months.short.${mk}`)}</span>
                      <span className="month-val">
                        {isPaid ? formatPKR(val) : t("plot.pending")}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="fin-grid">
                <div className="fin-cell">
                  <span className="fin-label">{t("plot.expectedDue")}</span>
                  <span className="fin-value dark">{formatPKR(sel.totalDue)}</span>
                </div>
                <div className="fin-cell">
                  <span className="fin-label">{t("plot.totalCollected")}</span>
                  <span className="fin-value green">{formatPKR(sel.totalReceived)}</span>
                </div>
                <div className="fin-cell">
                  <span className="fin-label">{t("plot.outstandingOverdue")}</span>
                  <span className="fin-value red">{formatPKR(sel.remaining)}</span>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-section-head">
                  <span className="progress-section-label">{t("plot.annualPaymentProgress")}</span>
                  <span className="progress-section-pct">
                    {sel.totalDue > 0 ? Math.round((sel.totalReceived / sel.totalDue) * 100) : 0}% {t("plot.complete")}
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${sel.totalDue > 0 ? Math.min(100, (sel.totalReceived / sel.totalDue) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-card">
              <div className="empty-icon">📋</div>
              <p className="empty-text">{t("plot.noPaymentRecord", { year })}</p>
            </div>
          )
        )}

        {/* ── All Years ── */}
        {allYears && (
          <div className="history-card">
            <div className="history-card-head">
              <span className="history-title">{t("plot.annualDuesHistory")}</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>{t("common.year")}</th>
                    <th>{t("plot.monthlyRate")}</th>
                    <th>{t("plot.totalDue")}</th>
                    <th>{t("plot.totalReceived")}</th>
                    <th>{t("plot.outstanding")}</th>
                    <th className="right">{t("plot.statusPct")}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p: any) => {
                    const pct = p.totalDue > 0 ? Math.round((p.totalReceived / p.totalDue) * 100) : 0;
                    const pctCls = pct >= 90 ? "pct-green" : pct >= 50 ? "pct-amber" : "pct-red";
                    return (
                      <tr
                        key={p.year}
                        onClick={() => { setYear(p.year); setAllYears(false); }}
                      >
                        <td className="year-cell">{p.year}</td>
                        <td>{formatPKR(p.mcRate)}</td>
                        <td>{formatPKR(p.totalDue)}</td>
                        <td className="green">{formatPKR(p.totalReceived)}</td>
                        <td className="red">{formatPKR(p.remaining)}</td>
                        <td className="right">
                          <span className={`pct-badge ${pctCls}`}>{pct}% {t("plot.paidLabel")}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
