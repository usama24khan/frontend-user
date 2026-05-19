'use client';
import { MONTHS, MONTH_LABELS } from '../../constants/phases';

interface PaymentMonthGridProps {
  payments: Record<string, number | null>;
  mcRate: number;
}

export default function PaymentMonthGrid({ payments, mcRate }: PaymentMonthGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 8 }}>
      {MONTHS.map((month) => {
        const val = payments?.[month];
        const isPaid = val !== null && val !== undefined && val > 0;
        const isFull = isPaid && val >= mcRate;
        const cls = isFull ? 'paid' : isPaid ? 'partial' : 'unpaid';

        return (
          <div key={month} className={`month-box ${cls}`}>
            <span style={{ fontSize: 10, opacity: 0.7 }}>{MONTH_LABELS[month]}</span>
            <span style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>
              {isPaid ? val : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
