"use client";

interface ProgressBarProps {
  value: number;
  max?: number;
  height?: number;
  showLabel?: boolean;
  variant?: "auto" | "success" | "warning" | "danger";
}

export default function ProgressBar({
  value,
  max = 100,
  height = 6,
  showLabel = true,
  variant = "auto",
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const tone =
    variant === "auto"
      ? pct >= 70
        ? "success"
        : pct >= 40
          ? "warning"
          : "danger"
      : variant;

  const fillClass =
    tone === "success" ? "" : tone === "warning" ? "warning" : "danger";

  const labelColor =
    tone === "success"
      ? "text-emerald-700"
      : tone === "warning"
        ? "text-amber-700"
        : "text-rose-700";

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="progress-track flex-1"
        style={{ height }}
      >
        <div
          className={`progress-fill ${fillClass}`.trim()}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-[11px] font-semibold tabular-nums min-w-8.5 text-right ${labelColor}`}>
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
