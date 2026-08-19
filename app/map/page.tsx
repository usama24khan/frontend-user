"use client";

/**
 * Resident-facing society map.
 *
 * Differs from the admin page on purpose: no dues or allotment tinting (that is
 * an admin analysis view), and tapping a plot opens a detail card *below* the
 * map rather than a modal — on a phone a card you can read while still seeing
 * the plan beats a sheet that covers it.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import SocietyMap from "../../components/SocietyMap";
import ErrorBanner from "../../components/ui/ErrorBanner";
import { getPlots } from "../../services";
import {
  PLOTS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  BLOCK_LETTERS,
  UNCERTAIN_PLOTS,
  type PlotShape,
} from "../../constants/societyMap";

interface PlotData {
  _id: string;
  ownerName: string;
  plotNumber: string;
  block: string;
  plotBlock: string;
  allotmentStatus?: string;
}

export default function SocietyMapPage() {
  const { t } = useTranslation();

  const [records, setRecords] = useState<PlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusBlock, setFocusBlock] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PlotShape | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getPlots({ page: 1, limit: 3000 });
        if (!cancelled) setRecords(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load plots");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Register records keyed by `${number}-${block}`, falling back to the number. */
  const byKey = useMemo(() => {
    const m = new Map<string, PlotData>();
    for (const p of records) {
      const num = String(p.plotNumber ?? "").trim();
      const blk = (p.block ?? "").trim().toUpperCase();
      if (!num) continue;
      m.set(`${num}-${blk}`, p);
      if (!m.has(num)) m.set(num, p);
    }
    return m;
  }, [records]);

  const highlight = useMemo(() => {
    const q = search.trim();
    if (!q) return [];
    return PLOTS.filter((p) => String(p.number).startsWith(q)).map((p) => p.number);
  }, [search]);

  const record = selected ? (byKey.get(selected.id) ?? byKey.get(String(selected.number))) : null;

  return (
    <>
      <style>{styles}</style>
      <div className="umap-root">
        <header className="page-header">
          <div>
            <div className="header-eyebrow">
              <span className="eyebrow-dot" />
              <span className="eyebrow-text">{t("nav.explore")}</span>
            </div>
            <h1 className="page-title">{t("societyMap.title")}</h1>
            <p className="page-sub">{t("societyMap.subtitleUser")}</p>
          </div>
          <input
            className="umap-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("societyMap.searchPlaceholderUser")}
            inputMode="numeric"
          />
        </header>

        {error && <ErrorBanner message={error} />}

        <div className="block-chips" role="group" aria-label={t("societyMap.zoomToBlock")}>
          <button
            type="button"
            className={`chip${focusBlock === null ? " is-on" : ""}`}
            onClick={() => setFocusBlock(null)}
          >
            {t("common.all", { defaultValue: "All" })}
          </button>
          {BLOCK_LETTERS.map((b) => (
            <button
              key={b}
              type="button"
              className={`chip${focusBlock === b ? " is-on" : ""}`}
              onClick={() => setFocusBlock(focusBlock === b ? null : b)}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="umap-card">
          <SocietyMap
            focusBlock={focusBlock}
            highlight={highlight}
            selectedId={selected?.id ?? null}
            onPlotClick={setSelected}
            height={560}
          />
        </div>

        {selected && (
          <section className="detail" aria-live="polite">
            <div className="detail-head">
              <div className="detail-id">
                <span className="detail-number">{selected.number}</span>
                <span className="detail-block">
                  {t("societyMap.blockNamed", { block: selected.block })}
                </span>
              </div>
              <button type="button" className="detail-close" onClick={() => setSelected(null)}>
                {t("societyMap.close")}
              </button>
            </div>

            <dl className="detail-grid">
              <div className="detail-cell">
                <dt>{t("societyMap.plotTypeLabel")}</dt>
                <dd className="detail-cat">
                  <span
                    className="detail-swatch"
                    style={{ background: CATEGORY_COLORS[selected.category] }}
                  />
                  {t(`societyMap.category.${selected.category}`, {
                    defaultValue: CATEGORY_LABELS[selected.category],
                  })}
                </dd>
              </div>
              <div className="detail-cell">
                <dt>{t("societyMap.ownerLabel")}</dt>
                <dd>
                  {loading ? "…" : record?.ownerName || t("societyMap.notInRegisterOwner")}
                </dd>
              </div>
            </dl>

            {selected.uncertain && (
              <p className="detail-note">{t("societyMap.uncertainNote")}</p>
            )}

            {record && (
              <Link href={`/plots/${record._id}`} className="detail-link">
                {t("societyMap.viewRecord")}
              </Link>
            )}
          </section>
        )}

        <section className="legend-note">
          <h2 className="legend-note-title">{t("societyMap.aboutTitle")}</h2>
          <p>{t("societyMap.aboutBody", { count: PLOTS.length })}</p>
          <p>{t("societyMap.aboutUncertain", { count: UNCERTAIN_PLOTS.length })}</p>
        </section>
      </div>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  :root {
    --bg: #f4f6f9;
    --surface: #ffffff;
    --border: rgba(0,0,0,0.07);
    --border-mid: rgba(0,0,0,0.13);
    --accent: #059669;
    --accent-dim: rgba(5,150,105,0.08);
    --accent-mid: rgba(5,150,105,0.16);
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #94a3b8;
  }

  .umap-root * { box-sizing: border-box; }
  .umap-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg); color: var(--text-primary);
    min-height: 100vh; padding: 20px; max-width: 1400px; margin: 0 auto;
  }
  [dir="rtl"] .umap-root { font-family: 'Noto Nastaliq Urdu', 'Plus Jakarta Sans', sans-serif; }

  .page-header {
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    padding: 18px 22px; display: flex; align-items: center; justify-content: space-between;
    gap: 16px; flex-wrap: wrap; margin-bottom: 14px; box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  .header-eyebrow { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
  .eyebrow-text {
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--accent);
  }
  .page-title { font-size: 19px; font-weight: 700; letter-spacing: -0.2px; line-height: 1.25; }
  .page-sub { font-size: 12.5px; color: var(--text-secondary); margin-top: 4px; font-weight: 500; max-width: 440px; }

  .umap-search {
    font-family: inherit; font-size: 14px; font-weight: 500; color: var(--text-primary);
    background: #fff; border: 1px solid var(--border-mid); border-radius: 8px;
    padding: 10px 12px; min-height: 44px; min-width: 190px; outline: none;
  }
  .umap-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }

  .block-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
  .chip {
    font-family: inherit; font-size: 12.5px; font-weight: 700; color: var(--text-secondary);
    background: #fff; border: 1px solid var(--border-mid); border-radius: 8px;
    min-width: 42px; min-height: 42px; padding: 0 12px; cursor: pointer;
  }
  .chip.is-on { background: var(--accent-dim); border-color: var(--accent-mid); color: var(--accent); }

  .umap-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    padding: 14px; box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }

  /* ── Detail card ── */
  .detail {
    background: var(--surface); border: 1px solid var(--accent-mid); border-radius: 12px;
    padding: 16px 18px; margin-top: 12px; box-shadow: 0 2px 10px rgba(15,23,42,0.06);
  }
  .detail-head {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; margin-bottom: 14px;
  }
  .detail-id { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
  .detail-number {
    font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 700;
    line-height: 1; letter-spacing: -0.5px;
  }
  .detail-block { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
  .detail-close {
    font-family: inherit; font-size: 12.5px; font-weight: 600; color: var(--text-secondary);
    background: #f1f5f9; border: none; border-radius: 8px;
    min-height: 40px; padding: 0 14px; cursor: pointer; flex-shrink: 0;
  }
  .detail-close:hover { background: #e2e8f0; }

  .detail-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px; margin: 0;
  }
  .detail-cell {
    background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px;
  }
  .detail-cell dt {
    font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text-muted); margin-bottom: 5px;
  }
  .detail-cell dd { margin: 0; font-size: 13.5px; font-weight: 600; }
  .detail-cat { display: flex; align-items: center; gap: 7px; }
  .detail-swatch {
    width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0;
    border: 1px solid rgba(0,0,0,0.18);
  }
  .detail-note {
    font-size: 12px; color: #92400e; background: #fffbeb; border: 1px solid #fde68a;
    border-radius: 8px; padding: 9px 11px; margin: 12px 0 0; line-height: 1.55;
  }
  .detail-link {
    display: inline-flex; align-items: center; min-height: 44px; margin-top: 12px;
    font-size: 13px; font-weight: 700; color: var(--accent); text-decoration: none;
  }
  .detail-link:hover { text-decoration: underline; }

  .legend-note {
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    padding: 16px 20px; margin-top: 14px; box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  .legend-note-title {
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--text-muted); margin-bottom: 10px;
  }
  .legend-note p {
    font-size: 12.5px; color: var(--text-secondary); line-height: 1.65; margin: 0 0 8px;
  }
  .legend-note p:last-child { margin-bottom: 0; }

  /* ── Phones ── */
  @media (max-width: 640px) {
    .umap-root { padding: 12px; }
    .page-header { padding: 14px 16px; gap: 12px; }
    .page-title { font-size: 17px; }
    .umap-search { width: 100%; min-width: 0; }
    .umap-card { padding: 10px; }
    .detail { padding: 14px; }
    .detail-number { font-size: 22px; }
    .legend-note { padding: 14px 16px; }
  }
`;
