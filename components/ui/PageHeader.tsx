"use client";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  right,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 mb-6 ${className}`.trim()}>
      <div>
        <h1 className="text-xl sm:text-[22px] font-semibold text-gray-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}
