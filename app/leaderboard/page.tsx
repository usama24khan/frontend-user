"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { getTopPlots, getTopBlocks, getDefaulters } from "../../services";
import Spinner from "../../components/ui/Spinner";
import { YEARS_WITH_DATA, getMcRateForYear } from "../../constants/phases";

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
    --gold: #d97706;
    --silver: #64748b;
    --bronze: #c2410c;
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

  .lb-root * { box-sizing: border-box; }

  .lb-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg);
    color: var(--text-primary);
    min-height: 100vh;
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
  }
  [dir="rtl"] .lb-root { font-family: 'Noto Nastaliq Urdu', 'Plus Jakarta Sans', sans-serif; }

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
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }
  .year-select {
    background: transparent;
    border: none;
    font-family: inherit;
    font-size: 13px;
    font-weight: 800;
    color: var(--text-primary);
    cursor: pointer;
    outline: none;
    padding: 0;
  }
  .year-select option { background: #fff; color: #0f172a; }

  /* ── Tabs ── */
  .tab-bar {
    display: flex;
    background: var(--surface-2);
    border: 1px solid var(--border-mid);
    padding: 5px;
    border-radius: var(--radius);
    gap: 4px;
    margin-bottom: 20px;
    overflow-x: auto;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .tab-btn {
    flex: 1;
    min-width: 120px;
    text-align: center;
    padding: 9px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-muted);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
    white-space: nowrap;
  }
  .tab-btn:hover:not(.active) { color: var(--text-primary); background: var(--surface-3); }
  .tab-btn.active {
    background: var(--surface);
    color: var(--accent);
    box-shadow: var(--shadow-sm);
  }

  /* ── List Card ── */
  .list-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }
  .list-card-header {
    padding: 16px 22px;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .list-card-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .list-card-body {
    max-height: 600px;
    overflow-y: auto;
  }
  .list-card-body::-webkit-scrollbar { width: 4px; }
  .list-card-body::-webkit-scrollbar-thumb { background: var(--border-mid); border-radius: 4px; }

  /* ── List Item ── */
  .list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 22px;
    border-bottom: 1px solid var(--border);
    gap: 14px;
    transition: background 0.15s;
    text-decoration: none;
    color: inherit;
  }
  .list-item:last-child { border-bottom: none; }
  .list-item:hover { background: var(--surface-2); }
  .list-item-left {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
    flex: 1;
  }
  .list-item-right {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }

  /* Rank medal */
  .rank-badge {
    width: 36px; height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
    flex-shrink: 0;
    border: 1.5px solid;
  }
  .rank-1 {
    background: rgba(217,119,6,0.1);
    color: var(--gold);
    border-color: rgba(217,119,6,0.3);
    box-shadow: 0 0 10px rgba(217,119,6,0.15);
  }
  .rank-2 {
    background: rgba(100,116,139,0.1);
    color: var(--silver);
    border-color: rgba(100,116,139,0.3);
  }
  .rank-3 {
    background: rgba(194,65,12,0.08);
    color: var(--bronze);
    border-color: rgba(194,65,12,0.25);
  }
  .rank-other {
    background: var(--surface-3);
    color: var(--text-muted);
    border-color: var(--border);
  }

  /* Block icon */
  .block-mini-badge {
    width: 38px; height: 38px;
    border-radius: 10px;
    background: var(--accent-dim);
    border: 1px solid var(--accent-mid);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
    flex-shrink: 0;
  }
  .danger-icon-wrap {
    width: 38px; height: 38px;
    border-radius: 10px;
    background: var(--red-dim);
    border: 1px solid rgba(225,29,72,0.18);
    color: var(--red);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .item-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 260px;
  }
  .item-meta {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 500;
    margin-top: 2px;
  }
  .item-amount {
    font-size: 14px;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: -0.3px;
    white-space: nowrap;
  }
  .amount-green { color: var(--accent); }
  .amount-red   { color: var(--red); }

  /* Progress mini */
  .progress-mini {
    width: 110px;
    height: 5px;
    background: var(--surface-3);
    border-radius: 99px;
    overflow: hidden;
  }
  @media (max-width: 640px) { .progress-mini { display: none; } }
  .progress-mini-fill {
    height: 100%;
    background: linear-gradient(90deg, #34d399, var(--accent));
    border-radius: 99px;
    transition: width 0.6s ease;
  }
  .item-rate {
    font-size: 14px;
    font-weight: 800;
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
  }
  .item-rate-sub {
    font-size: 10px;
    font-weight: 600;
    color: var(--text-muted);
    font-family: 'JetBrains Mono', monospace;
    text-align: right;
  }

  /* Status badge */
  .status-pill {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 99px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .pill-active {
    background: var(--accent-dim);
    border: 1px solid var(--accent-mid);
    color: var(--accent);
  }
  .pill-red {
    background: var(--red-dim);
    border: 1px solid rgba(225,29,72,0.2);
    color: var(--red);
  }

  /* States */
  .center-spinner { display: flex; justify-content: center; align-items: center; min-height: 280px; }
  .empty-state {
    padding: 56px 24px;
    text-align: center;
  }
  .empty-icon {
    font-size: 30px;
    margin-bottom: 10px;
  }
  .empty-text {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
  }

  .fade-in { animation: fadeUp 0.3s ease both; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 640px) {
    .lb-root { padding: 16px; }
    .page-header { padding: 18px 20px; }
    .page-title { font-size: 21px; }
    .list-item { padding: 12px 16px; gap: 10px; }
    .list-card-header { padding: 14px 18px; }
    .item-name { max-width: 150px; }
  }
`;

function rankClass(idx: number) {
  if (idx === 0) return "rank-1";
  if (idx === 1) return "rank-2";
  if (idx === 2) return "rank-3";
  return "rank-other";
}

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [activeTab, setActiveTab] = useState<"plots" | "blocks" | "defaulters">("plots");
  const [loading, setLoading] = useState(true);
  const [topPlots, setTopPlots] = useState<any[]>([]);
  const [topBlocks, setTopBlocks] = useState<any[]>([]);
  const [defaulters, setDefaulters] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        if (activeTab === "plots") {
          const data = await getTopPlots(year);
          if (active) setTopPlots(data);
        } else if (activeTab === "blocks") {
          const data = await getTopBlocks(year);
          if (active) setTopBlocks(data);
        } else {
          const data = await getDefaulters(year);
          if (active) {
            const zeroPayment = data.zeroPayment || [];
            const noRecord = data.noRecord || [];
            const rate = getMcRateForYear(year);
            const combined = [
              ...zeroPayment.map((p: any) => ({ plot: p.plot, totalDue: p.totalDue })),
              ...noRecord.map((plot: any) => ({ plot, totalDue: rate * 12 })),
            ];
            setDefaulters(combined);
          }
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchLeaderboard();
    return () => { active = false; };
  }, [year, activeTab]);

  const TABS = [
    { key: "plots" as const, label: t("leaderboard.topPlots") },
    { key: "blocks" as const, label: t("leaderboard.topBlocks") },
    { key: "defaulters" as const, label: t("leaderboard.defaulters") },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="lb-root">

        {/* ── Header ── */}
        <div className="page-header">
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="header-eyebrow">
              <div className="eyebrow-dot" />
              <span className="eyebrow-text">{t("leaderboard.eyebrow")}</span>
            </div>
            <h1 className="page-title">{t("leaderboard.title")}</h1>
            <p className="page-sub">{t("leaderboard.subtitle")}</p>
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

        {/* ── Tabs ── */}
        <div className="tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="center-spinner"><Spinner /></div>
        ) : (
          <div className="list-card fade-in">

            {/* TOP PLOTS */}
            {activeTab === "plots" && (
              <>
                <div className="list-card-header">
                  <div className="list-card-title">
                    {t("leaderboard.highestPaidPlots", { year })}
                  </div>
                </div>
                <div className="list-card-body">
                  {topPlots.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🏅</div>
                      <p className="empty-text">{t("leaderboard.noPlotCollections", { year })}</p>
                    </div>
                  ) : (
                    topPlots.map((item, idx) => (
                      <Link key={idx} href={`/plots/${item.plot._id}`} className="list-item">
                        <div className="list-item-left">
                          <div className={`rank-badge ${rankClass(idx)}`}>{idx + 1}</div>
                          <div style={{ minWidth: 0 }}>
                            <div className="item-name">{item.plot.ownerName}</div>
                            <div className="item-meta">
                              {t("plot.plotNumber")} {item.plot.plotBlock} · {t("plot.phase")} {item.plot.phase}
                            </div>
                          </div>
                        </div>
                        <div className="list-item-right">
                          <span className="item-amount amount-green">{formatPKR(item.totalPaid)}</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </>
            )}

            {/* TOP BLOCKS */}
            {activeTab === "blocks" && (
              <>
                <div className="list-card-header">
                  <div className="list-card-title">
                    {t("leaderboard.topPerformingBlocks", { year })}
                  </div>
                </div>
                <div className="list-card-body">
                  {topBlocks.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📊</div>
                      <p className="empty-text">{t("leaderboard.noBlockData")}</p>
                    </div>
                  ) : (
                    topBlocks.map((item, idx) => (
                      <Link key={idx} href={`/blocks/${item.block}`} className="list-item">
                        <div className="list-item-left">
                          <div className={`rank-badge ${rankClass(idx)}`}>{idx + 1}</div>
                          <div className="block-mini-badge">{item.block}</div>
                          <div style={{ minWidth: 0 }}>
                            <div className="item-name">
                              {t("plot.block")} {item.block}
                            </div>
                            <div className="item-meta">
                              {t("plot.phase")} {item.phase} · {t("leaderboard.collectionProgress")}
                            </div>
                          </div>
                        </div>
                        <div className="list-item-right">
                          <div className="progress-mini">
                            <div
                              className="progress-mini-fill"
                              style={{ width: `${Math.min(100, item.collectionRate)}%` }}
                            />
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div className="item-rate">{item.collectionRate}%</div>
                            <div className="item-rate-sub">{formatPKR(item.totalCollected)}</div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </>
            )}

            {/* DEFAULTERS */}
            {activeTab === "defaulters" && (
              <>
                <div className="list-card-header">
                  <div className="list-card-title">
                    {t("leaderboard.unpaidRegistry", { year })}
                  </div>
                </div>
                <div className="list-card-body">
                  {defaulters.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">✅</div>
                      <p className="empty-text">{t("leaderboard.noDefaulters")}</p>
                    </div>
                  ) : (
                    defaulters.map((item, idx) => (
                      <Link key={idx} href={`/plots/${item.plot?._id}`} className="list-item">
                        <div className="list-item-left">
                          <div className="danger-icon-wrap">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M12 9v4m0 4h.01M4.93 19h14.14c1.34 0 2.17-1.46 1.5-2.63L13.5 4.37c-.67-1.17-2.33-1.17-3 0L3.43 16.37c-.67 1.17.16 2.63 1.5 2.63z" />
                            </svg>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div className="item-name">
                              {item.plot?.ownerName || t("leaderboard.unknownOwner")}
                            </div>
                            <div className="item-meta">
                              {t("plot.plotNumber")} {item.plot?.plotBlock || "—"}
                            </div>
                          </div>
                        </div>
                        <div className="list-item-right">
                          <span className={`status-pill ${item.plot?.allotmentStatus === "Active" ? "pill-active" : "pill-red"}`}>
                            {item.plot?.allotmentStatus || t("status.active")}
                          </span>
                          <span className="item-amount amount-red">{formatPKR(item.totalDue)}</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
