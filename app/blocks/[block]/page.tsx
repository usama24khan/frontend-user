"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import Spinner from "../../../components/ui/Spinner";
import ErrorBanner from "../../../components/ui/ErrorBanner";
import { getBlockDetail } from "../../../services";
import { BLOCK_PHASE_MAP } from "../../../constants/phases";

const formatPKR = (n: number) => "₨ " + Math.round(n).toLocaleString("en-PK");

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
    --blue: #2563eb;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #94a3b8;
  }

  .bd-root * { box-sizing: border-box; }
  .bd-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg);
    color: var(--text-primary);
    min-height: 100vh;
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
  }
  [dir="rtl"] .bd-root { font-family: 'Noto Nastaliq Urdu', 'Plus Jakarta Sans', sans-serif; }

  /* Header */
  .bd-header {
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
  .bd-pills {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .bd-pill {
    font-size: 10px;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 99px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .bd-pill-accent {
    background: var(--accent-dim);
    color: var(--accent);
    border: 1px solid var(--accent-mid);
    font-family: 'JetBrains Mono', monospace;
  }
  .bd-pill-muted {
    background: var(--surface-3);
    color: var(--text-secondary);
    border: 1px solid var(--border-mid);
  }
  .bd-title {
    font-size: 19px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.2px;
    line-height: 1.25;
  }
  .bd-sub {
    font-size: 12.5px;
    color: var(--text-secondary);
    margin-top: 4px;
    font-weight: 500;
    max-width: 480px;
  }

  /* Year selector */
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
  }
  .year-select option { background: #fff; color: #0f172a; }

  /* KPIs */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
  @media (max-width: 900px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 480px) { .kpi-grid { grid-template-columns: 1fr; } }
  .kpi {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 16px;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  .kpi-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }
  .kpi-value {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace;
    margin-top: 6px;
    letter-spacing: -0.3px;
  }
  .kpi-value.green { color: var(--accent); }
  .kpi-value.red { color: var(--red); }
  .kpi-value.blue { color: var(--blue); }
  .kpi-value.amber { color: var(--amber); }
  .kpi-delta {
    font-size: 10.5px;
    color: var(--text-muted);
    margin-top: 4px;
    font-weight: 500;
  }

  /* List card */
  .list-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  .list-head {
    padding: 12px 18px;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .list-head-title {
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }
  .list-body {
    max-height: 540px;
    overflow-y: auto;
  }
  .list-body::-webkit-scrollbar { width: 4px; }
  .list-body::-webkit-scrollbar-thumb { background: var(--border-mid); border-radius: 4px; }

  .list-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-bottom: 1px solid var(--border);
    gap: 14px;
    color: inherit;
  }
  .list-row:last-child { border-bottom: none; }
  .list-row-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }
  .list-row-right {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
  }
  .dues-badge {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
  }
  .dues-label {
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
  }
  .dues-amount {
    font-size: 12.5px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    color: var(--red);
  }
  .dues-amount.clear { color: var(--accent); }
  .row-avatar {
    width: 34px; height: 34px;
    border-radius: 8px;
    background: var(--accent-dim);
    border: 1px solid var(--accent-mid);
    color: var(--accent);
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .row-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 220px;
  }
  .row-meta {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 500;
    margin-top: 2px;
  }
  .status-pill {
    font-size: 9.5px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 99px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .pill-active { background: var(--accent-dim); color: var(--accent); border: 1px solid var(--accent-mid); }
  .pill-red { background: var(--red-dim); color: var(--red); border: 1px solid rgba(225,29,72,0.18); }

.empty-state {
    padding: 48px 24px;
    text-align: center;
    font-size: 13px;
    color: var(--text-muted);
    font-weight: 500;
  }

  .center-spinner { display: flex; justify-content: center; align-items: center; min-height: 240px; }

  .fade-in { animation: fadeUp 0.3s ease both; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 640px) {
    .bd-root { padding: 14px; }
    .bd-header { padding: 16px 18px; }
    .bd-title { font-size: 17px; }
  }
`;

export default function BlockDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const block = (params.block as string)?.toUpperCase();
  const currentYear = new Date().getFullYear();
  const [plots, setPlots] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlockDetails = async () => {
    let active = true;
    setLoading(true);
    setError(null);
    try {
      const data = await getBlockDetail(block, currentYear);
      if (active) {
        setPlots(data.plots || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      if (active) setError(err instanceof Error ? err.message : "Failed to load block details.");
    } finally {
      if (active) setLoading(false);
    }
    return () => { active = false; };
  };

  useEffect(() => {
    if (block) fetchBlockDetails();
  }, [block]);

  return (
    <>
      <style>{styles}</style>
      <div className="bd-root fade-in">

        {/* Header */}
        <div className="bd-header">
          <div>
            <div className="bd-pills">
              <span className="bd-pill bd-pill-accent">{t("plot.block")} {block}</span>
              <span className="bd-pill bd-pill-muted">
                {t("plot.phase")} {BLOCK_PHASE_MAP[block] || "?"}
              </span>
            </div>
            <h1 className="bd-title">{t("blocks.blockDetails")}</h1>
            <p className="bd-sub">
              {t("blocks.blockDetailsSubtitle", { count: plots.length, block })}
            </p>
          </div>

          <div className="year-selector">
            <span className="year-label">{t("common.year")}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{currentYear}</span>
          </div>
        </div>

        {loading ? (
          <div className="center-spinner"><Spinner /></div>
        ) : error ? (
          <ErrorBanner message={error} onRetry={fetchBlockDetails} />
        ) : (
          <>
            {/* KPIs */}
            <div className="kpi-grid">
              <div className="kpi">
                <div className="kpi-label">{t("blocks.totalPlots")}</div>
                <div className="kpi-value blue">{stats?.totalPlots || plots.length}</div>
                <div className="kpi-delta">{t("blocks.blockProperties")}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">{t("blocks.collected")}</div>
                <div className="kpi-value green">{formatPKR(stats?.totalCollected || 0)}</div>
                <div className="kpi-delta">{t("blocks.receivedDues")}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">{t("blocks.remaining")}</div>
                <div className="kpi-value red">{formatPKR(stats?.remaining || 0)}</div>
                <div className="kpi-delta">{t("blocks.unpaidOutstanding")}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">{t("blocks.collectionRate")}</div>
                <div className="kpi-value amber">{stats?.collectionRate || 0}%</div>
                <div className="kpi-delta">{t("blocks.progress")}</div>
              </div>
            </div>

            {/* List */}
            <div className="list-card">
              <div className="list-head">
                <span className="list-head-title">{t("blocks.propertyRegisters")}</span>
              </div>

              <div className="list-body">
                {plots.length === 0 ? (
                  <div className="empty-state">{t("blocks.noProperties", { block })}</div>
                ) : (
                  plots.map((plot) => {
                    const isActive = plot.allotmentStatus === "Active";
                    const remaining = plot.remaining ?? 0;
                    return (
                      <div key={plot._id} className="list-row">
                        <div className="list-row-left">
                          <div className="row-avatar">{plot.plotBlock}</div>
                          <div style={{ minWidth: 0 }}>
                            <div className="row-name">{plot.ownerName}</div>
                            <div className="row-meta">
                              {t("plot.block")} {plot.block} — {t("plot.plotNumber")} {plot.plotNumber}
                            </div>
                          </div>
                        </div>
                        <div className="list-row-right">
                          <span className={`status-pill ${isActive ? "pill-active" : "pill-red"}`}>
                            {plot.allotmentStatus}
                          </span>
                          <div className="dues-badge">
                            <span className="dues-label">{t("blocks.remaining")}</span>
                            <span className={`dues-amount ${remaining === 0 ? "clear" : ""}`}>
                              {remaining === 0 ? "✓ Clear" : formatPKR(remaining)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
