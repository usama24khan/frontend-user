"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  societyNotices,
  getNoticeDownloadUrl,
  type SocietyNotice,
} from "../../services";
import Spinner from "../../components/ui/Spinner";
import ErrorBanner from "../../components/ui/ErrorBanner";
import { formatPKR } from "../../constants/phases";

const styles = `
  .rn-root {
    max-width: 920px;
    margin: 0 auto;
    padding: 24px 20px 40px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #0f172a;
  }
  [dir="rtl"] .rn-root { font-family: 'Noto Nastaliq Urdu', 'Plus Jakarta Sans', sans-serif; }

  .rn-header {
    background: #fff;
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 14px;
    padding: 20px 22px;
    margin-bottom: 18px;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  .rn-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 10.5px; font-weight: 800;
    color: #059669; text-transform: uppercase; letter-spacing: 0.12em;
    margin-bottom: 6px;
  }
  .rn-eyebrow::before {
    content: ""; width: 5px; height: 5px; border-radius: 50%; background: #10b981;
  }
  .rn-title {
    font-size: 22px; font-weight: 800; margin: 0 0 4px;
    letter-spacing: -0.01em;
  }
  .rn-sub { font-size: 13px; color: #64748b; margin: 0; }

  .rn-card {
    background: #fff;
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  .rn-row {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
  }
  .rn-row:last-child { border-bottom: none; }
  .rn-row-icon {
    flex-shrink: 0;
    width: 38px; height: 38px; border-radius: 10px;
    background: #ecfdf5; color: #047857;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid #d1fae5;
  }
  .rn-row-main { flex: 1; min-width: 0; }
  .rn-row-title {
    font-size: 14px; font-weight: 700; color: #0f172a;
    margin: 0 0 3px;
  }
  .rn-tag {
    display: inline-block;
    padding: 2px 8px; border-radius: 999px;
    background: #f1f5f9; color: #475569;
    font-size: 10.5px; font-weight: 700;
    text-transform: capitalize;
    margin-right: 6px;
    vertical-align: middle;
  }
  .rn-tag.year { background: #fffbeb; color: #92400e; }
  .rn-row-meta {
    display: flex; flex-wrap: wrap; align-items: center;
    gap: 2px 7px;
    font-size: 12px; color: #64748b; font-weight: 500;
    font-variant-numeric: tabular-nums;
    margin: 0;
  }
  .rn-meta-sep { color: #cbd5e1; }

  .rn-deadline {
    display: inline-flex; align-items: center;
    margin: 5px 0 0;
    padding: 2px 8px; border-radius: 6px;
    background: #fffbeb; color: #92400e;
    font-size: 11.5px; font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .rn-row-actions {
    display: flex; align-items: center; gap: 12px;
    flex-shrink: 0;
    justify-content: flex-end;
  }
  .rn-due {
    /* Never let a currency figure break across lines. */
    flex-shrink: 0; white-space: nowrap;
    text-align: end;
    font-size: 13px; font-weight: 800;
    color: #dc2626;
    font-variant-numeric: tabular-nums;
    margin-inline-end: auto;
  }
  .rn-download {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    flex-shrink: 0; white-space: nowrap;
    min-height: 38px; padding: 0 14px; border-radius: 10px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #fff; font-size: 12.5px; font-weight: 700;
    border: none; cursor: pointer; text-decoration: none;
    transition: opacity 140ms;
    box-shadow: 0 2px 6px rgba(16,185,129,0.30);
  }
  .rn-download:hover { opacity: 0.92; }

  .rn-empty {
    padding: 60px 30px;
    text-align: center;
    color: #94a3b8;
  }
  .rn-empty-icon {
    width: 56px; height: 56px; border-radius: 18px;
    background: #f1f5f9; color: #94a3b8;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 12px;
  }
  .rn-empty-title {
    font-size: 15px; font-weight: 700; color: #0f172a;
    margin: 0 0 4px;
  }
  .rn-empty-body { font-size: 13px; margin: 0; }

  .rn-loading {
    padding: 60px 0;
    display: flex; align-items: center; justify-content: center;
  }

  /* ── Phones ──
     The row was icon | title+meta | dues | download on one line. Below ~640px
     there is no room for four, so the dues and the download drop to their own
     line and the title gets the full width instead of being crushed. */
  @media (max-width: 640px) {
    .rn-row {
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 10px 12px;
      padding: 14px 16px;
    }
    .rn-row-icon { width: 34px; height: 34px; }
    .rn-row-main { flex: 1 1 auto; }
    /* flex-basis 100% is what forces the wrap — without it the row would just
       keep shrinking the title to fit everything on one line. */
    .rn-row-actions { flex: 1 0 100%; }
    .rn-download { min-height: 44px; padding: 0 18px; font-size: 13px; }
    .rn-row-title { font-size: 13.5px; line-height: 1.45; }
    .rn-row-meta { font-size: 11.5px; }
  }

`;

export default function SocietyNoticesPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<SocietyNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotices = async () => {
    let active = true;
    setLoading(true);
    setError(null);
    try {
      const data = await societyNotices();
      if (active) setItems(data);
    } catch (err) {
      if (active) setError(err instanceof Error ? err.message : "Failed to load notices.");
    } finally {
      if (active) setLoading(false);
    }
    return () => { active = false; };
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDownload = (pdfPath: string) => {
    if (!pdfPath) return;
    window.open(getNoticeDownloadUrl(pdfPath), "_blank");
  };

  const formatYearLabel = (n: SocietyNotice) => {
    if (n.yearFrom && n.yearTo && n.yearFrom !== n.yearTo) {
      return `${n.yearFrom}–${n.yearTo}`;
    }
    return String(n.yearTo || n.year);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="rn-root">
        <div className="rn-header">
          <div className="rn-eyebrow">{t("societyNotices.eyebrow")}</div>
          <h1 className="rn-title">{t("societyNotices.title")}</h1>
          <p className="rn-sub">{t("societyNotices.subtitleAll")}</p>
        </div>

        <div className="rn-card">
          {loading ? (
            <div className="rn-loading"><Spinner /></div>
          ) : error ? (
            <ErrorBanner message={error} onRetry={fetchNotices} />
          ) : items.length === 0 ? (
            <div className="rn-empty">
              <div className="rn-empty-icon">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                  <path d="M14 2v6h6" />
                </svg>
              </div>
              <p className="rn-empty-title">{t("societyNotices.emptyTitle")}</p>
              <p className="rn-empty-body">{t("societyNotices.emptyBody")}</p>
            </div>
          ) : (
            items.map((n) => (
              <div key={n._id} className="rn-row">
                <div className="rn-row-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </div>
                <div className="rn-row-main">
                  <p className="rn-row-title">
                    <span className="rn-tag">{n.type}</span>
                    <span className="rn-tag year">{formatYearLabel(n)}</span>
                    {/* Notices are society-wide here, so lead with who it targets.
                        Pre-migration records have no label, and a plot targetId
                        is a raw ObjectId — show a generic label for those. */}
                    {n.targetLabel ||
                      (n.type === "plot" ? t("societyNotices.plotNotice") : n.targetId)}
                  </p>
                  {/* Separate elements rather than one interpolated string: on a
                      phone the joined "language · date · Deadline: date" ran wider
                      than the row and dragged the layout with it. These wrap. */}
                  <p className="rn-row-meta">
                    <span>
                      {n.language === "ur"
                        ? t("societyNotices.languageUrdu")
                        : t("societyNotices.languageEnglish")}
                    </span>
                    <span className="rn-meta-sep" aria-hidden="true">
                      ·
                    </span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </p>
                  {/* A deadline is the one thing a resident acts on, so it gets its
                      own line and its own emphasis instead of trailing a grey run-on. */}
                  {n.paymentDeadline && (
                    <p className="rn-deadline">
                      {t("societyNotices.deadline")}:{" "}
                      {new Date(n.paymentDeadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {/* Grouped so the phone layout can drop the pair onto its own
                    line instead of squeezing them against the title. */}
                {(n.totalDue > 0 || n.pdfPath) && (
                  <div className="rn-row-actions">
                    {n.totalDue > 0 && (
                      <span className="rn-due">{formatPKR(n.totalDue)}</span>
                    )}
                    {n.pdfPath && (
                      <button
                        type="button"
                        onClick={() => handleDownload(n.pdfPath)}
                        className="rn-download"
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {t("societyNotices.download")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
