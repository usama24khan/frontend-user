"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "../../store";
import {
  residentNotices,
  getNoticeDownloadUrl,
  type ResidentNotice,
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
    font-size: 12px; color: #64748b; font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  .rn-due {
    text-align: right;
    font-size: 13px; font-weight: 800;
    color: #dc2626;
    font-variant-numeric: tabular-nums;
    margin-right: 12px;
  }
  .rn-download {
    display: inline-flex; align-items: center; gap: 6px;
    height: 38px; padding: 0 14px; border-radius: 10px;
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
`;

export default function ResidentNoticesPage() {
  const { t } = useTranslation();
  const resident = useSelector((s: RootState) => s.auth.resident);
  const [items, setItems] = useState<ResidentNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotices = async () => {
    let active = true;
    setLoading(true);
    setError(null);
    try {
      const data = await residentNotices();
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

  const formatYearLabel = (n: ResidentNotice) => {
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
          <div className="rn-eyebrow">{t("residentNotices.eyebrow")}</div>
          <h1 className="rn-title">{t("residentNotices.title")}</h1>
          <p className="rn-sub">
            {resident
              ? t("residentNotices.subtitle", { plot: resident.plotBlock })
              : t("residentNotices.subtitleAnon")}
          </p>
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
              <p className="rn-empty-title">{t("residentNotices.emptyTitle")}</p>
              <p className="rn-empty-body">{t("residentNotices.emptyBody")}</p>
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
                    {n.language === "ur"
                      ? t("residentNotices.languageUrdu")
                      : t("residentNotices.languageEnglish")}
                  </p>
                  <p className="rn-row-meta">
                    {new Date(n.createdAt).toLocaleDateString()}
                    {n.paymentDeadline
                      ? ` · ${t("residentNotices.deadline")}: ${new Date(n.paymentDeadline).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
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
                    {t("residentNotices.download")}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
