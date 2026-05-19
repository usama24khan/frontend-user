"use client";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delta?: string;
  color?: "green" | "red" | "amber" | "blue";
}

const colorMap = {
  green: {
    iconBg: "#eaf3de",
    iconColor: "#3b6d11",
    bar: "#3b6d11",
    deltaBg: "#eaf3de",
    deltaText: "#3b6d11",
  },
  red: {
    iconBg: "#fcebeb",
    iconColor: "#a32d2d",
    bar: "#a32d2d",
    deltaBg: "#fcebeb",
    deltaText: "#a32d2d",
  },
  amber: {
    iconBg: "#faeeda",
    iconColor: "#854f0b",
    bar: "#854f0b",
    deltaBg: "#faeeda",
    deltaText: "#854f0b",
  },
  blue: {
    iconBg: "#e6f1fb",
    iconColor: "#185fa5",
    bar: "#185fa5",
    deltaBg: "#e6f1fb",
    deltaText: "#185fa5",
  },
};

export default function StatCard({
  icon,
  label,
  value,
  delta,
  color = "green",
}: StatCardProps) {
  const c = colorMap[color];
  return (
    <div
      style={{
        background: "var(--color-background-primary, #fff)",
        border: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))",
        borderRadius: 16,
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: c.bar,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "#6b7280",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            marginTop: 4,
          }}
        >
          {label}
        </p>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: c.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: c.iconColor,
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>

      <div>
        <p
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: "#111827",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
          }}
        >
          {value}
        </p>
        {delta && (
          <span
            style={{
              display: "inline-block",
              marginTop: 8,
              fontSize: 11,
              fontWeight: 500,
              color: c.deltaText,
              background: c.deltaBg,
              padding: "3px 8px",
              borderRadius: 999,
            }}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
