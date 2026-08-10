"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  submitComplaint,
  trackComplaint,
  getMyComplaints,
  rememberComplaint,
  type ComplaintStatus,
  type TrackedComplaint,
  type RememberedComplaint,
} from "../../services";

const styles = `
  .cp-root {
    max-width: 760px;
    margin: 0 auto;
    padding: 24px 20px 40px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #0f172a;
  }
  [dir="rtl"] .cp-root { font-family: 'Noto Nastaliq Urdu', 'Plus Jakarta Sans', sans-serif; }

  .cp-header {
    background: #fff;
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 14px;
    padding: 20px 22px;
    margin-bottom: 14px;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  .cp-eyebrow {
    font-size: 10.5px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: #059669; margin-bottom: 4px;
  }
  .cp-title { font-size: 19px; font-weight: 700; letter-spacing: -0.2px; margin: 0; }
  .cp-sub { font-size: 12.5px; color: #475569; margin: 5px 0 0; line-height: 1.55; }

  /* ── Tabs ── */
  .cp-tabs { display: flex; gap: 8px; margin-bottom: 14px; }
  .cp-tab {
    flex: 1;
    border: 1px solid rgba(0,0,0,0.09);
    background: #fff;
    border-radius: 11px;
    padding: 10px 14px;
    font-family: inherit; font-size: 13px; font-weight: 600;
    color: #475569; cursor: pointer;
    transition: all 0.15s;
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  }
  .cp-tab:hover { border-color: rgba(5,150,105,0.35); color: #047857; }
  .cp-tab.active {
    background: rgba(5,150,105,0.09);
    border-color: rgba(5,150,105,0.35);
    color: #047857;
  }
  .cp-tab-count {
    font-size: 11px; font-weight: 700;
    padding: 1px 7px; border-radius: 999px;
    background: rgba(15,23,42,0.06);
    font-variant-numeric: tabular-nums;
  }
  .cp-tab.active .cp-tab-count { background: rgba(5,150,105,0.16); }

  .cp-card {
    background: #fff;
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 14px;
    padding: 22px;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }

  .cp-field { margin-bottom: 16px; }
  .cp-label {
    display: block;
    font-size: 10.5px; font-weight: 700;
    letter-spacing: 0.09em; text-transform: uppercase;
    color: #64748b; margin-bottom: 6px;
  }
  .cp-input, .cp-textarea {
    width: 100%;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 11px;
    padding: 11px 13px;
    font-family: inherit; font-size: 14px; font-weight: 500;
    color: #0f172a; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  }
  .cp-input::placeholder, .cp-textarea::placeholder { color: #94a3b8; font-weight: 400; }
  .cp-input:focus, .cp-textarea:focus {
    border-color: #059669; background: #fff;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.12);
  }
  .cp-textarea { min-height: 130px; resize: vertical; line-height: 1.6; }
  .cp-hint { font-size: 11px; color: #94a3b8; margin: 6px 0 0; }
  .cp-counter { font-size: 11px; color: #94a3b8; font-variant-numeric: tabular-nums; }
  .cp-label-row { display: flex; align-items: baseline; justify-content: space-between; }

  .cp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  @media (max-width: 560px) { .cp-row { grid-template-columns: 1fr; } }

  .cp-submit {
    width: 100%; height: 48px;
    border: none; border-radius: 12px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff; font-family: inherit; font-size: 14px; font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(5,150,105,0.25);
    transition: opacity 0.15s, box-shadow 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .cp-submit:hover:not(:disabled) { opacity: 0.94; box-shadow: 0 6px 16px rgba(5,150,105,0.32); }
  .cp-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .cp-spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
    animation: cp-spin 0.7s linear infinite;
  }
  @keyframes cp-spin { to { transform: rotate(360deg); } }

  .cp-alert {
    border-radius: 11px; padding: 11px 14px;
    font-size: 12.5px; font-weight: 500;
    margin-bottom: 16px; line-height: 1.5;
  }
  .cp-alert.err { background: #fff1f2; border: 1px solid #fecdd3; color: #be123c; }

  /* ── Tracking number receipt ── */
  .cp-success { text-align: center; padding: 12px 6px 6px; }
  .cp-success-icon {
    width: 56px; height: 56px; border-radius: 50%;
    background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px;
  }
  .cp-success-title { font-size: 17px; font-weight: 700; margin: 0 0 6px; }
  .cp-success-body { font-size: 13px; color: #475569; margin: 0 0 18px; line-height: 1.6; }

  .cp-ticket {
    background: #f8fafc;
    border: 1.5px dashed #a7f3d0;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 18px;
  }
  .cp-ticket-label {
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.11em; text-transform: uppercase;
    color: #64748b; margin-bottom: 6px;
  }
  .cp-ticket-number {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 22px; font-weight: 700; color: #047857;
    letter-spacing: 0.02em;
    word-break: break-all;
  }
  .cp-copy {
    margin-top: 10px;
    background: #fff; border: 1.5px solid #e2e8f0; border-radius: 9px;
    padding: 7px 14px;
    font-family: inherit; font-size: 12px; font-weight: 600;
    color: #334155; cursor: pointer; transition: all 0.15s;
  }
  .cp-copy:hover { border-color: #059669; color: #059669; }

  .cp-actions-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  .cp-again {
    background: #fff; border: 1.5px solid #e2e8f0; border-radius: 11px;
    padding: 10px 18px;
    font-family: inherit; font-size: 13px; font-weight: 600;
    color: #334155; cursor: pointer; transition: all 0.15s;
  }
  .cp-again:hover { border-color: #059669; color: #059669; }

  /* ── Status pills ── */
  .cp-status {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 11px; border-radius: 999px;
    font-size: 11.5px; font-weight: 700;
    white-space: nowrap;
  }
  .cp-status::before {
    content: ""; width: 6px; height: 6px; border-radius: 50%;
    background: currentColor;
  }
  .cp-status.pending { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }
  .cp-status.in_progress { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
  .cp-status.resolved { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }

  /* ── Lookup ── */
  .cp-lookup-row { display: flex; gap: 10px; align-items: flex-start; }
  .cp-lookup-row .cp-input { flex: 1; font-family: 'JetBrains Mono', ui-monospace, monospace; }
  .cp-lookup-btn {
    height: 45px; padding: 0 20px;
    border: none; border-radius: 11px;
    background: #059669; color: #fff;
    font-family: inherit; font-size: 13.5px; font-weight: 700;
    cursor: pointer; transition: background 0.15s, opacity 0.15s;
    flex-shrink: 0;
  }
  .cp-lookup-btn:hover:not(:disabled) { background: #047857; }
  .cp-lookup-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  @media (max-width: 480px) {
    .cp-lookup-row { flex-direction: column; }
    .cp-lookup-btn { width: 100%; }
  }

  /* ── Result / list rows ── */
  .cp-result {
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 12px;
    padding: 16px;
    margin-top: 16px;
    background: #fff;
  }
  .cp-result-top {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; flex-wrap: wrap; margin-bottom: 10px;
  }
  .cp-result-number {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 14px; font-weight: 700; color: #0f172a;
  }
  .cp-result-name { font-size: 12.5px; color: #64748b; font-weight: 500; margin-bottom: 10px; }
  .cp-result-message {
    background: #f8fafc; border: 1px solid rgba(0,0,0,0.06);
    border-radius: 10px; padding: 11px 13px;
    font-size: 13px; line-height: 1.6; color: #334155;
    white-space: pre-wrap; word-break: break-word;
    margin-bottom: 12px;
  }

  /* Timeline */
  .cp-timeline { border-top: 1px solid #f1f5f9; padding-top: 12px; }
  .cp-timeline-label {
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: #94a3b8; margin-bottom: 9px;
  }
  .cp-step {
    display: flex; align-items: center; gap: 9px;
    font-size: 12.5px; color: #475569; font-weight: 500;
    padding: 3px 0;
  }
  .cp-step-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #10b981; flex-shrink: 0;
  }
  .cp-step-time {
    margin-inline-start: auto;
    font-size: 11.5px; color: #94a3b8;
    font-variant-numeric: tabular-nums;
  }

  .cp-list-row {
    display: flex; align-items: center; gap: 12px;
    padding: 13px 0;
    border-bottom: 1px solid #f1f5f9;
    flex-wrap: wrap;
  }
  .cp-list-row:last-child { border-bottom: none; }
  .cp-list-main { flex: 1; min-width: 0; }
  .cp-list-number {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 13px; font-weight: 700; color: #0f172a;
  }
  .cp-list-meta {
    font-size: 11.5px; color: #94a3b8; font-weight: 500;
    margin-top: 2px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    max-width: 100%;
  }
  .cp-list-check {
    background: none; border: none; padding: 0;
    font-family: inherit; font-size: 12px; font-weight: 700;
    color: #059669; cursor: pointer; flex-shrink: 0;
  }
  .cp-list-check:hover { text-decoration: underline; }

  .cp-empty {
    padding: 34px 16px; text-align: center;
    color: #94a3b8; font-size: 13px; font-weight: 500; line-height: 1.6;
  }

  .fade-in { animation: cpFade 0.28s ease both; }
  @keyframes cpFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
`;

const MAX_MESSAGE = 1500;

type Tab = "submit" | "track";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const formatDateTime = (d: string) =>
  new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

export default function ComplaintsPage() {
  const { t } = useTranslation();

  const [tab, setTab] = useState<Tab>("submit");

  // Submit form
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ trackingNumber: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Tracking
  const [lookupValue, setLookupValue] = useState("");
  const [looking, setLooking] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [tracked, setTracked] = useState<TrackedComplaint | null>(null);
  const [mine, setMine] = useState<RememberedComplaint[]>([]);

  useEffect(() => {
    setMine(getMyComplaints());
  }, []);

  const runLookup = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        setLookupError(t("complaint.enterTracking"));
        return;
      }
      setLooking(true);
      setLookupError(null);
      setTracked(null);
      try {
        const result = await trackComplaint(trimmed);
        setTracked(result);
      } catch (err: any) {
        setLookupError(err?.message || t("complaint.lookupFailed"));
      } finally {
        setLooking(false);
      }
    },
    [t],
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !mobile.trim() || !message.trim()) {
      setError(t("complaint.fillAll"));
      return;
    }
    const digits = mobile.replace(/[^\d]/g, "");
    if (digits.length < 10 || digits.length > 15) {
      setError(t("complaint.invalidMobile"));
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitComplaint({
        name: name.trim(),
        mobile: mobile.trim(),
        message: message.trim(),
      });
      // Remember it on this device so it appears in "My complaints" — the portal
      // account is shared, so the server can't build that list for us.
      rememberComplaint({
        trackingNumber: result.trackingNumber,
        name: name.trim(),
        message: message.trim(),
        createdAt: result.createdAt,
      });
      setMine(getMyComplaints());
      setReceipt({ trackingNumber: result.trackingNumber });
      setCopied(false);
      setName("");
      setMobile("");
      setMessage("");
    } catch (err: any) {
      setError(err?.message || t("complaint.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const copyTracking = async () => {
    if (!receipt) return;
    try {
      await navigator.clipboard.writeText(receipt.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* clipboard blocked — the number is on screen anyway */ }
  };

  const openInTracker = (trackingNumber: string) => {
    setTab("track");
    setLookupValue(trackingNumber);
    runLookup(trackingNumber);
  };

  const statusLabel = (s: ComplaintStatus) => t(`complaint.status.${s}`);

  return (
    <>
      <style>{styles}</style>
      <div className="cp-root">
        <div className="cp-header">
          <div className="cp-eyebrow">{t("complaint.eyebrow")}</div>
          <h1 className="cp-title">{t("complaint.title")}</h1>
          <p className="cp-sub">{t("complaint.subtitle")}</p>
        </div>

        {/* Tabs */}
        <div className="cp-tabs">
          <button
            type="button"
            className={`cp-tab${tab === "submit" ? " active" : ""}`}
            onClick={() => setTab("submit")}
          >
            {t("complaint.tabSubmit")}
          </button>
          <button
            type="button"
            className={`cp-tab${tab === "track" ? " active" : ""}`}
            onClick={() => setTab("track")}
          >
            {t("complaint.tabTrack")}
            {mine.length > 0 && <span className="cp-tab-count">{mine.length}</span>}
          </button>
        </div>

        {/* ── Submit ── */}
        {tab === "submit" && (
          <div className="cp-card">
            {receipt ? (
              <div className="cp-success fade-in">
                <div className="cp-success-icon">
                  <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="cp-success-title">{t("complaint.successTitle")}</h2>
                <p className="cp-success-body">{t("complaint.successBody")}</p>

                <div className="cp-ticket">
                  <div className="cp-ticket-label">{t("complaint.yourTrackingNumber")}</div>
                  <div className="cp-ticket-number">{receipt.trackingNumber}</div>
                  <button type="button" className="cp-copy" onClick={copyTracking}>
                    {copied ? t("complaint.copied") : t("complaint.copy")}
                  </button>
                </div>

                <p className="cp-success-body">{t("complaint.keepNumber")}</p>

                <div className="cp-actions-row">
                  <button
                    type="button"
                    className="cp-again"
                    onClick={() => openInTracker(receipt.trackingNumber)}
                  >
                    {t("complaint.checkStatus")}
                  </button>
                  <button type="button" className="cp-again" onClick={() => setReceipt(null)}>
                    {t("complaint.submitAnother")}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="fade-in">
                {error && <div className="cp-alert err">{error}</div>}

                <div className="cp-row">
                  <div className="cp-field">
                    <label className="cp-label" htmlFor="cp-name">{t("complaint.name")}</label>
                    <input
                      id="cp-name" className="cp-input" type="text"
                      value={name} onChange={(e) => setName(e.target.value)}
                      placeholder={t("complaint.namePlaceholder")}
                      maxLength={120} autoComplete="name"
                    />
                  </div>
                  <div className="cp-field">
                    <label className="cp-label" htmlFor="cp-mobile">{t("complaint.mobile")}</label>
                    <input
                      id="cp-mobile" className="cp-input" type="tel" inputMode="tel"
                      value={mobile} onChange={(e) => setMobile(e.target.value)}
                      placeholder="0300-0000000" maxLength={30} dir="ltr" autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="cp-field">
                  <div className="cp-label-row">
                    <label className="cp-label" htmlFor="cp-message">{t("complaint.details")}</label>
                    <span className="cp-counter">{message.length} / {MAX_MESSAGE}</span>
                  </div>
                  <textarea
                    id="cp-message" className="cp-textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
                    placeholder={t("complaint.detailsPlaceholder")}
                  />
                  <p className="cp-hint">{t("complaint.detailsHint")}</p>
                </div>

                <button type="submit" className="cp-submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="cp-spinner" />
                      {t("complaint.submitting")}
                    </>
                  ) : (
                    t("complaint.submit")
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Track ── */}
        {tab === "track" && (
          <div className="fade-in">
            <div className="cp-card" style={{ marginBottom: 14 }}>
              <label className="cp-label" htmlFor="cp-lookup">{t("complaint.trackingNumber")}</label>
              <div className="cp-lookup-row">
                <input
                  id="cp-lookup" className="cp-input" type="text"
                  value={lookupValue}
                  onChange={(e) => setLookupValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") runLookup(lookupValue); }}
                  placeholder="CMP-2026-0001"
                  dir="ltr" autoCapitalize="characters" spellCheck={false}
                />
                <button
                  type="button" className="cp-lookup-btn"
                  disabled={looking || !lookupValue.trim()}
                  onClick={() => runLookup(lookupValue)}
                >
                  {looking ? t("complaint.checking") : t("complaint.check")}
                </button>
              </div>
              <p className="cp-hint">{t("complaint.trackingHint")}</p>

              {lookupError && (
                <div className="cp-alert err" style={{ marginTop: 14, marginBottom: 0 }}>
                  {lookupError}
                </div>
              )}

              {tracked && (
                <div className="cp-result fade-in">
                  <div className="cp-result-top">
                    <span className="cp-result-number">{tracked.trackingNumber}</span>
                    <span className={`cp-status ${tracked.status}`}>
                      {statusLabel(tracked.status)}
                    </span>
                  </div>
                  <div className="cp-result-name">
                    {tracked.name} · {t("complaint.submittedOn")} {formatDate(tracked.createdAt)}
                  </div>
                  <div className="cp-result-message">{tracked.message}</div>

                  {tracked.statusHistory?.length > 0 && (
                    <div className="cp-timeline">
                      <div className="cp-timeline-label">{t("complaint.progress")}</div>
                      {tracked.statusHistory.map((ev, i) => (
                        <div key={i} className="cp-step">
                          <span className="cp-step-dot" />
                          <span>{statusLabel(ev.status)}</span>
                          <span className="cp-step-time">{formatDateTime(ev.at)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* My complaints — remembered on this device only */}
            <div className="cp-card">
              <div className="cp-timeline-label" style={{ marginBottom: 4 }}>
                {t("complaint.myComplaints")}
              </div>
              {mine.length === 0 ? (
                <div className="cp-empty">{t("complaint.noneOnDevice")}</div>
              ) : (
                <>
                  <p className="cp-hint" style={{ marginBottom: 6 }}>
                    {t("complaint.deviceOnlyHint")}
                  </p>
                  {mine.map((c) => (
                    <div key={c.trackingNumber} className="cp-list-row">
                      <div className="cp-list-main">
                        <div className="cp-list-number">{c.trackingNumber}</div>
                        <div className="cp-list-meta">
                          {formatDate(c.createdAt)} · {c.message}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="cp-list-check"
                        onClick={() => openInTracker(c.trackingNumber)}
                      >
                        {t("complaint.check")} →
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
