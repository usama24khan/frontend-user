"use client";

interface YearSelectorProps {
  value: number;
  onChange: (year: number) => void;
}

const YEARS = [2021, 2022, 2023, 2024, 2025, 2026];

export default function YearSelector({ value, onChange }: YearSelectorProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button
        onClick={() => onChange(value - 1)}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          border: "0.5px solid rgba(0,0,0,0.12)",
          background: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          color: "#374151",
        }}
        aria-label="Previous year"
      >
        ‹
      </button>

      <div
        style={{
          padding: "6px 20px",
          border: "0.5px solid rgba(0,0,0,0.12)",
          borderRadius: 8,
          background: "#fff",
          fontSize: 13,
          fontWeight: 500,
          color: "#111827",
          minWidth: 72,
          textAlign: "center",
        }}
      >
        {value}
      </div>

      <button
        onClick={() => onChange(value + 1)}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          border: "0.5px solid rgba(0,0,0,0.12)",
          background: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          color: "#374151",
        }}
        aria-label="Next year"
      >
        ›
      </button>
    </div>
  );
}
