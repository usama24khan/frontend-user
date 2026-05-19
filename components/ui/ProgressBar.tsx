"use client";

interface ProgressBarProps {
  value: number;
  max?: number;
  height?: number;
  showLabel?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  height = 6,
  showLabel = true,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = pct >= 70 ? "#3b6d11" : pct >= 40 ? "#854f0b" : "#a32d2d";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          flex: 1,
          height,
          background: "#e5e7eb",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            background: color,
            transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
      {showLabel && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color,
            minWidth: 34,
            textAlign: "right",
          }}
        >
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
