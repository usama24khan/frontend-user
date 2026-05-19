"use client";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 28,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: "#111827",
            letterSpacing: "-0.3px",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 3 }}>
            {subtitle}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}
