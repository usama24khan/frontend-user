"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import MobilePopup from "./MobilePopup";

// ── Types ─────────────────────────────────────────────────────────────────────
export type FeedbackType = "success" | "error" | "info";

interface FeedbackMessage {
  id: number;
  type: FeedbackType;
  message: string;
}

interface FeedbackContextValue {
  showFeedback: (opts: { type: FeedbackType; message: string }) => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

let _id = 0;

// ── Provider ──────────────────────────────────────────────────────────────────
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<FeedbackMessage[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");
  // Desktop toast timer ref
  const desktopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = useCallback(({ type, message }: { type: FeedbackType; message: string }) => {
    const id = ++_id;
    setQueue((q) => [...q, { id, type, message }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setQueue((q) => q.filter((m) => m.id !== id));
  }, []);

  // Desktop: auto-dismiss success/info after 4s via the desktop toast bar
  useEffect(() => {
    if (isMobile || queue.length === 0) return;
    const first = queue[0];
    if (first.type === "error") return; // errors stay until dismissed
    if (desktopTimerRef.current) clearTimeout(desktopTimerRef.current);
    desktopTimerRef.current = setTimeout(() => dismiss(first.id), 4000);
    return () => {
      if (desktopTimerRef.current) clearTimeout(desktopTimerRef.current);
    };
  }, [queue, isMobile, dismiss]);

  const current = queue[0] ?? null;

  return (
    <FeedbackContext.Provider value={{ showFeedback }}>
      {children}
      {/* Mobile: centered popup */}
      {isMobile && current && (
        <MobilePopup
          key={current.id}
          type={current.type}
          message={current.message}
          onDismiss={() => dismiss(current.id)}
        />
      )}
      {/* Desktop: top-right toast bar (matches existing .stp-toast style) */}
      {!isMobile && current && (
        <div
          role="alert"
          aria-live="polite"
          className={`kkb4-desktop-toast ${current.type}`}
          onClick={() => dismiss(current.id)}
        >
          {current.type === "success" && (
            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {current.type === "error" && (
            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span>{current.message}</span>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used inside FeedbackProvider");
  return ctx;
}
