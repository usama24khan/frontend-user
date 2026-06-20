"use client";
import { useEffect, useRef } from "react";
import type { FeedbackType } from "./FeedbackContext";

interface MobilePopupProps {
  type: FeedbackType;
  message: string;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 2500;

export default function MobilePopup({ type, message, onDismiss }: MobilePopupProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss for success/info; errors need explicit tap
  useEffect(() => {
    if (type === "error") return;
    timerRef.current = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [type, onDismiss]);

  const icon =
    type === "success" ? (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ) : type === "error" ? (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ) : (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );

  return (
    <>
      {/* Backdrop */}
      <div
        className="mobile-popup-backdrop"
        onClick={type === "error" ? onDismiss : undefined}
        aria-hidden="true"
      />
      {/* Card */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={type === "error" ? "Error" : type === "success" ? "Success" : "Info"}
        className={`mobile-popup-card mobile-popup-${type}`}
        onClick={onDismiss}
      >
        <div className={`mobile-popup-icon-wrap mobile-popup-icon-${type}`}>
          {icon}
        </div>
        <p className="mobile-popup-msg">{message}</p>
        {type === "error" && (
          <button className="mobile-popup-ok btn btn-primary btn-sm" onClick={onDismiss}>
            OK
          </button>
        )}
      </div>
    </>
  );
}
