"use client";

interface YearSelectorProps {
  value: number;
  onChange: (year: number) => void;
  min?: number;
  max?: number;
}

export default function YearSelector({
  value,
  onChange,
  min = 2012,
  max = new Date().getFullYear(),
}: YearSelectorProps) {
  const canPrev = value > min;
  const canNext = value < max;

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => canPrev && onChange(value - 1)}
        disabled={!canPrev}
        aria-label="Previous year"
        className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="px-4 py-1.5 min-w-19.5 text-center rounded-lg border border-gray-200 bg-white text-[13px] font-semibold text-gray-900 tabular-nums">
        {value}
      </div>

      <button
        type="button"
        onClick={() => canNext && onChange(value + 1)}
        disabled={!canNext}
        aria-label="Next year"
        className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
