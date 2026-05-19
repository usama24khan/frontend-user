"use client";

export default function Card({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid rgba(0,0,0,0.08)",
        borderRadius: 16,
        padding: "22px 24px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
