"use client";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

// Inline error card shown when a page-level data fetch fails.
// Uses only inline styles so it works regardless of which page CSS is loaded.
export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  const isRateLimit = message.toLowerCase().includes("too many");
  const isOffline    = message.toLowerCase().includes("internet") || message.toLowerCase().includes("connection");

  const icon = isOffline ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" /><path d="M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
    </svg>
  ) : isRateLimit ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: "48px 24px",
      textAlign: "center",
      background: "#fff",
      border: "1px solid rgba(225,29,72,0.15)",
      borderRadius: 16,
      margin: "24px 0",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        background: "rgba(225,29,72,0.07)",
        color: "#e11d48",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
          {isRateLimit ? "Rate limited" : isOffline ? "No connection" : "Something went wrong"}
        </p>
        <p style={{ fontSize: 13, color: "#64748b", margin: 0, maxWidth: 320 }}>{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: 4,
            padding: "8px 20px",
            background: "#059669",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
