"use client";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delta?: string;
  color?: "green" | "red" | "amber" | "blue";
}

const colorMap = {
  green: { iconBg: "bg-emerald-50",  iconText: "text-emerald-700",  bar: "from-emerald-500 to-emerald-600",  pill: "bg-emerald-50 text-emerald-700"  },
  red:   { iconBg: "bg-rose-50",     iconText: "text-rose-700",     bar: "from-rose-500 to-rose-600",        pill: "bg-rose-50 text-rose-700"        },
  amber: { iconBg: "bg-amber-50",    iconText: "text-amber-700",    bar: "from-amber-500 to-amber-600",      pill: "bg-amber-50 text-amber-700"      },
  blue:  { iconBg: "bg-blue-50",     iconText: "text-blue-700",     bar: "from-blue-500 to-blue-600",        pill: "bg-blue-50 text-blue-700"        },
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
    <div className="relative overflow-hidden bg-white border border-gray-200 rounded-2xl px-5 py-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`absolute inset-x-0 top-0 h-0.75 bg-linear-to-r ${c.bar}`} />

      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mt-1">
          {label}
        </p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg} ${c.iconText}`}>
          {icon}
        </div>
      </div>

      <p className="text-2xl sm:text-[26px] font-bold text-gray-900 tabular-nums leading-tight tracking-tight">
        {value}
      </p>

      {delta && (
        <span className={`inline-block mt-3 text-[11px] font-semibold px-2 py-1 rounded-full ${c.pill}`}>
          {delta}
        </span>
      )}
    </div>
  );
}
