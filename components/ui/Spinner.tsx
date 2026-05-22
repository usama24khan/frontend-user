"use client";

interface SpinnerProps {
  size?: number;
  inline?: boolean;
  label?: string;
}

export default function Spinner({ size = 32, inline = false, label }: SpinnerProps) {
  const ring = (
    <span
      role="status"
      aria-label={label || "Loading"}
      className="inline-block rounded-full border-2 border-gray-200 border-t-emerald-500 animate-spin"
      style={{ width: size, height: size }}
    />
  );

  if (inline) return ring;

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      {ring}
      {label && <p className="text-xs font-medium text-gray-500">{label}</p>}
    </div>
  );
}
