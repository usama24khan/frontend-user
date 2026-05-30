"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { getPlots } from "../../services";
import Spinner from "../../components/ui/Spinner";
import {
  ALL_BLOCKS,
  ALL_PHASES,
  BLOCK_PHASE_MAP,
} from "../../constants/phases";

interface PlotData {
  _id: string;
  srNo: number;
  ownerName: string;
  plotNumber: string;
  block: string;
  phase: string;
  plotBlock: string;
  plotCode?: string;
  allotmentStatus: string;
}

/* ─── Styles ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  :root {
    --bg: #f4f6f9;
    --surface: #ffffff;
    --surface-2: #f8fafc;
    --surface-3: #f1f5f9;
    --border: rgba(0,0,0,0.07);
    --border-bright: rgba(0,0,0,0.13);
    --accent: #059669;
    --accent-dim: rgba(5,150,105,0.08);
    --accent-mid: rgba(5,150,105,0.15);
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

  .plots-root * { box-sizing: border-box; }

  .plots-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg);
    color: var(--text-primary);
    min-height: 100vh;
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
  }
  [dir="rtl"] .plots-root { font-family: 'Noto Nastaliq Urdu', 'Plus Jakarta Sans', sans-serif; }

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
    margin-bottom: 14px;
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
  }
  .page-sub strong {
    color: var(--accent);
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
  }

  /* ── Search ── */
  .search-wrap {
    position: relative;
    flex-shrink: 0;
  }
  .search-icon {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
  }
  .search-input {
    background: #fff;
    border: 1px solid var(--border-bright);
    border-radius: 8px;
    padding: 8px 12px 8px 32px;
    font-family: inherit;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-primary);
    width: 240px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .search-input::placeholder { color: var(--text-muted); }
  .search-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(5,150,105,0.12);
  }

  /* ── Filter Card ── */
  .filter-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 18px;
    margin-bottom: 14px;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  .filter-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .filter-row-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-muted);
    width: 48px;
    flex-shrink: 0;
  }
  .filter-divider {
    width: 100%;
    height: 1px;
    background: var(--border);
    margin: 12px 0;
  }

  /* Phase buttons */
  .phase-btn {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    padding: 5px 13px;
    border-radius: 7px;
    border: 1px solid var(--border-bright);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .phase-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
  .phase-btn.active { background: var(--accent-dim); border-color: rgba(5,150,105,0.3); color: var(--accent); }

  /* Block buttons */
  .block-btn {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .block-btn:hover { border-color: var(--border-bright); color: var(--text-secondary); background: var(--surface-2); }
  .block-btn.active { background: var(--accent-dim); border-color: rgba(5,150,105,0.3); color: var(--accent); }

  /* ── Block Group Card ── */
  .block-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
    margin-bottom: 12px;
    transition: box-shadow 0.15s;
  }
  .block-card:hover { box-shadow: 0 2px 8px rgba(15,23,42,0.06); }

  .block-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    background: var(--surface-2);
    border-bottom: 1px solid var(--border);
  }
  .block-letter-badge {
    width: 30px; height: 30px;
    background: var(--accent-dim);
    border: 1px solid var(--accent-mid);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12.5px;
    font-weight: 700;
    color: var(--accent);
    flex-shrink: 0;
    font-family: 'JetBrains Mono', monospace;
  }
  .block-header-info { margin-left: 10px; }
  .block-header-name {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-primary);
  }
  .block-header-meta {
    font-size: 10.5px;
    color: var(--text-muted);
    font-weight: 500;
    margin-top: 1px;
  }
  .block-header-left { display: flex; align-items: center; }
  .block-view-link {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--accent);
    text-decoration: none;
    padding: 4px 10px;
    border: 1px solid var(--accent-mid);
    border-radius: 6px;
    background: var(--accent-dim);
    transition: all 0.15s;
  }
  .block-view-link:hover { background: var(--accent); color: #fff; border-color: var(--accent); }

  /* ── Table ── */
  .plot-table {
    width: 100%;
    border-collapse: collapse;
  }
  .plot-table thead tr {
    background: transparent;
  }
  .plot-table th {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    padding: 10px 18px;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }
  .plot-table th.center { text-align: center; }
  .plot-table th.right { text-align: right; }

  .plot-table tbody tr {
    border-bottom: 1px solid var(--border);
    transition: background 0.12s;
  }
  .plot-table tbody tr:last-child { border-bottom: none; }
  .plot-table tbody tr:hover { background: var(--surface-2); }

  .plot-table td {
    padding: 10px 18px;
    font-size: 12.5px;
    color: var(--text-secondary);
  }
  .td-plot-code {
    font-weight: 700;
    color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11.5px;
  }
  .td-owner {
    font-weight: 600;
    color: var(--text-primary);
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .td-center { text-align: center; }
  .td-right { text-align: right; }
  .td-phase {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
  }

  /* Status badges */
  .status-badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 99px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .badge-active {
    background: rgba(5,150,105,0.08);
    color: #059669;
    border: 1px solid rgba(5,150,105,0.2);
  }
  .badge-cancelled {
    background: rgba(225,29,72,0.07);
    color: #e11d48;
    border: 1px solid rgba(225,29,72,0.18);
  }
  .badge-other {
    background: var(--surface-3);
    color: var(--text-muted);
    border: 1px solid var(--border-bright);
  }

  /* Details link */
  .details-link {
    font-size: 11px;
    font-weight: 700;
    color: var(--accent);
    text-decoration: none;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid transparent;
    transition: all 0.13s;
    white-space: nowrap;
  }
  .details-link:hover {
    background: var(--accent-dim);
    border-color: var(--accent-mid);
  }

  /* ── Pagination ── */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 20px 0 8px;
  }
  .page-btn {
    background: var(--surface);
    border: 1px solid var(--border-bright);
    border-radius: 8px;
    color: var(--text-secondary);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 12px;
    font-weight: 700;
    padding: 7px 16px;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  .page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
  .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .page-info {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    padding: 0 8px;
    font-family: 'JetBrains Mono', monospace;
  }

  /* ── States ── */
  .center-spinner { display: flex; justify-content: center; align-items: center; min-height: 200px; }
  .empty-state {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 48px 24px;
    text-align: center;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .empty-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }
  .empty-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .error-state {
    background: rgba(225,29,72,0.05);
    border: 1px solid rgba(225,29,72,0.15);
    border-radius: var(--radius);
    padding: 16px 20px;
    color: #e11d48;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
  }

  .fade-in { animation: fadeUp 0.3s ease both; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

/* ─── Page Component ─── */
export default function PlotsPage() {
  const { t } = useTranslation();
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [plots, setPlots] = useState<PlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 50;

  const fetchPlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPlots({
        page,
        limit,
        sortBy: 'block',
        sortOrder: 'asc',
        block: selectedBlock,
        phase: selectedPhase,
        search,
      });
      setPlots(result.data);
      setTotal(result.meta?.total || 0);
      setTotalPages(result.meta?.totalPages || 1);
    } catch {
      setError("Failed to load plots.");
    } finally {
      setLoading(false);
    }
  }, [page, selectedBlock, selectedPhase, search]);

  useEffect(() => { fetchPlots(); }, [fetchPlots]);
  useEffect(() => { setPage(1); }, [selectedBlock, selectedPhase, search]);

  const handlePhaseChange = (ph: string | null) => { setSelectedBlock(null); setSelectedPhase(ph); };
  const handleBlockChange = (b: string | null) => { setSelectedPhase(null); setSelectedBlock(b); };

  const groupedPlots = useMemo(() => {
    const groups: Record<string, PlotData[]> = {};
    for (const p of plots) {
      if (!groups[p.block]) groups[p.block] = [];
      groups[p.block].push(p);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [plots]);

  const activeLabel = selectedBlock
    ? `Block ${selectedBlock}`
    : selectedPhase ?? "All Society";

  return (
    <>
      <style>{styles}</style>
      <div className="plots-root">

        {/* ── Header ── */}
        <div className="page-header">
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="header-eyebrow">
              <div className="eyebrow-dot" />
              <span className="eyebrow-text">{t("plots.eyebrow")}</span>
            </div>
            <h1 className="page-title">{t("plots.title")}</h1>
            <p className="page-sub">
              {t("plots.subtitle")}{" "}
              <strong>{total}</strong> {t("plots.plotsCount", { count: total }).replace(/^\d+\s*/, "")}
            </p>
          </div>

          <div className="search-wrap">
            <svg className="search-icon" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("plots.searchPlaceholder")}
              className="search-input"
            />
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="filter-card">
          {/* Phases */}
          <div className="filter-row">
            <span className="filter-row-label">{t("plots.phase")}</span>
            <button
              onClick={() => handlePhaseChange(null)}
              className={`phase-btn ${!selectedPhase && !selectedBlock ? "active" : ""}`}
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

          <div className="filter-divider" />

          {/* Blocks */}
          <div className="filter-row">
            <span className="filter-row-label">{t("plots.block")}</span>
            {ALL_BLOCKS.map((b) => (
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

        {/* ── Content ── */}
        {loading ? (
          <div className="center-spinner"><Spinner /></div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : plots.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-icon">🔍</div>
            <p className="empty-text">{t("plots.noPlotsFound", { label: activeLabel })}</p>
          </div>
        ) : (
          <div className="fade-in">
            {groupedPlots.map(([block, blockPlots]) => (
              <div key={block} className="block-card">
                {/* Block Header */}
                <div className="block-card-header">
                  <div className="block-header-left">
                    <div className="block-letter-badge">{block}</div>
                    <div className="block-header-info">
                      <div className="block-header-name">{t("plot.block")} {block}</div>
                      <div className="block-header-meta">
                        {BLOCK_PHASE_MAP[block]} · {t("plots.plotsCount", { count: blockPlots.length })}
                      </div>
                    </div>
                  </div>
                  <Link href={`/blocks/${block}`} className="block-view-link">
                    {t("plots.viewBlock")} →
                  </Link>
                </div>

                {/* Table */}
                <table className="plot-table">
                  <thead>
                    <tr>
                      <th>{t("plots.th.plotNo")}</th>
                      <th>{t("plots.th.owner")}</th>
                      <th className="center">{t("plots.th.status")}</th>
                      <th className="right">{t("plots.th.phase")}</th>
                      <th className="right" />
                    </tr>
                  </thead>
                  <tbody>
                    {blockPlots.map((p) => (
                      <tr key={p._id}>
                        <td className="td-plot-code">{p.plotCode || p.plotBlock}</td>
                        <td className="td-owner">{p.ownerName}</td>
                        <td className="td-center">
                          <span className={`status-badge ${
                            p.allotmentStatus === "Active"
                              ? "badge-active"
                              : p.allotmentStatus === "Cancelled"
                              ? "badge-cancelled"
                              : "badge-other"
                          }`}>
                            {p.allotmentStatus}
                          </span>
                        </td>
                        <td className="td-right td-phase">{p.phase}</td>
                        <td className="td-right">
                          <Link href={`/plots/${p._id}`} className="details-link">
                            {t("plots.details")} →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  ← {t("common.prev")}
                </button>
                <span className="page-info">{page} / {totalPages}</span>
                <button
                  className="page-btn"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  {t("common.next")} →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}