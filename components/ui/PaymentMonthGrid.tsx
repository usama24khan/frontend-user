"use client";
import { MONTHS, MONTH_LABELS } from "../../constants/phases";

interface PaymentMonthGridProps {
  payments: Record<string, number | null>;
  mcRate: number;
}

export default function PaymentMonthGrid({ payments, mcRate }: PaymentMonthGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {MONTHS.map((month) => {
        const val = payments?.[month];
        const isPaid = val !== null && val !== undefined && val > 0;
        const isFull = isPaid && val >= mcRate;
        const cls = isFull ? "paid" : isPaid ? "partial" : "unpaid";

        return (
          <div key={month} className={`month-box ${cls}`}>
            <span className="text-[10px] font-bold uppercase opacity-75 tracking-wider">
              {MONTH_LABELS[month]}
            </span>
            <span className="text-[13px] font-bold mt-1 tabular-nums">
              {isPaid ? val : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
