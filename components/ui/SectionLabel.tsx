"use client";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionLabel({ children, className = "" }: SectionLabelProps) {
  return (
    <p className={`section-label mb-3 ${className}`.trim()}>{children}</p>
  );
}
