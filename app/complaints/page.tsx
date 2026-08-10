"use client";

import { useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { submitComplaint } from "../../services";

const styles = `
  .cp-root {
    max-width: 720px;
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
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #059669;
    margin-bottom: 4px;
  }
  .cp-title { font-size: 19px; font-weight: 700; letter-spacing: -0.2px; margin: 0; }
  .cp-sub { font-size: 12.5px; color: #475569; margin: 5px 0 0; line-height: 1.55; }

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
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 6px;
  }
  .cp-input, .cp-textarea {
    width: 100%;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 11px;
    padding: 11px 13px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    color: #0f172a;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  }
  .cp-input::placeholder, .cp-textarea::placeholder { color: #94a3b8; font-weight: 400; }
  .cp-input:focus, .cp-textarea:focus {
    border-color: #059669;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.12);
  }
  .cp-textarea { min-height: 130px; resize: vertical; line-height: 1.6; }
  .cp-hint { font-size: 11px; color: #94a3b8; margin: 6px 0 0; }
  .cp-counter { font-size: 11px; color: #94a3b8; font-variant-numeric: tabular-nums; }

  .cp-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  @media (max-width: 560px) { .cp-row { grid-template-columns: 1fr; } }

  .cp-label-row { display: flex; align-items: baseline; justify-content: space-between; }

  .cp-submit {
    width: 100%;
    height: 48px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff;
    font-family: inherit;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(5,150,105,0.25);
    transition: opacity 0.15s, box-shadow 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .cp-submit:hover:not(:disabled) { opacity: 0.94; box-shadow: 0 6px 16px rgba(5,150,105,0.32); }
  .cp-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .cp-spinner {
    width: 16px; height: 16px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    animation: cp-spin 0.7s linear infinite;
  }
  @keyframes cp-spin { to { transform: rotate(360deg); } }

  .cp-alert {
    border-radius: 11px;
    padding: 11px 14px;
    font-size: 12.5px;
    font-weight: 500;
    margin-bottom: 16px;
    line-height: 1.5;
  }
  .cp-alert.err { background: #fff1f2; border: 1px solid #fecdd3; color: #be123c; }

  /* ── Success state ── */
  .cp-success { text-align: center; padding: 18px 6px 6px; }
  .cp-success-icon {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #059669;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px;
  }
  .cp-success-title { font-size: 17px; font-weight: 700; margin: 0 0 6px; }
  .cp-success-body { font-size: 13px; color: #475569; margin: 0 0 20px; line-height: 1.6; }
  .cp-again {
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-radius: 11px;
    padding: 10px 18px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .cp-again:hover { border-color: #059669; color: #059669; }

  .fade-in { animation: cpFade 0.28s ease both; }
  @keyframes cpFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
`;

const MAX_MESSAGE = 1500;

export default function ComplaintsPage() {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

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
      await submitComplaint({
        name: name.trim(),
        mobile: mobile.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
      setName("");
      setMobile("");
      setMessage("");
    } catch (err: any) {
      setError(err?.message || t("complaint.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="cp-root">
        <div className="cp-header">
          <div className="cp-eyebrow">{t("complaint.eyebrow")}</div>
          <h1 className="cp-title">{t("complaint.title")}</h1>
          <p className="cp-sub">{t("complaint.subtitle")}</p>
        </div>

        <div className="cp-card">
          {submitted ? (
            <div className="cp-success fade-in">
              <div className="cp-success-icon">
                <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="cp-success-title">{t("complaint.successTitle")}</h2>
              <p className="cp-success-body">{t("complaint.successBody")}</p>
              <button type="button" className="cp-again" onClick={() => setSubmitted(false)}>
                {t("complaint.submitAnother")}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="fade-in">
              {error && <div className="cp-alert err">{error}</div>}

              <div className="cp-row">
                <div className="cp-field">
                  <label className="cp-label" htmlFor="cp-name">{t("complaint.name")}</label>
                  <input
                    id="cp-name"
                    className="cp-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("complaint.namePlaceholder")}
                    maxLength={120}
                    autoComplete="name"
                  />
                </div>

                <div className="cp-field">
                  <label className="cp-label" htmlFor="cp-mobile">{t("complaint.mobile")}</label>
                  <input
                    id="cp-mobile"
                    className="cp-input"
                    type="tel"
                    inputMode="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="0300-0000000"
                    maxLength={30}
                    dir="ltr"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="cp-field">
                <div className="cp-label-row">
                  <label className="cp-label" htmlFor="cp-message">{t("complaint.details")}</label>
                  <span className="cp-counter">{message.length} / {MAX_MESSAGE}</span>
                </div>
                <textarea
                  id="cp-message"
                  className="cp-textarea"
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
      </div>
    </>
  );
}
