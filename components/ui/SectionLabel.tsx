"use client";

export default function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 500,
        color: "#9ca3af",
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        marginBottom: 16,
      }}
    >
      {children}
    </p>
  );
}
