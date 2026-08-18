/**
 * The monthly maintenance charge, resolved per month.
 *
 * The charge rose from PKR 200 to PKR 400 in **May 2022**, part-way through the
 * year, so no single figure describes 2022: January to April are 200 and the
 * rest are 400. Anything deciding whether a month is fully paid has to ask per
 * month, or four months of 2022 will show as short when they are settled.
 *
 * Mirrors the backend schedule in `config/constants.ts`. The API also serves the
 * live schedule at `GET /config/rates` as `periods`, which `resolveRate` accepts
 * so an admin override is honoured when the caller has fetched it.
 */
export type RatePeriod = { year: number; fromMonth: number; rate: number };

export const RATE_PERIODS: RatePeriod[] = [
  { year: 2012, fromMonth: 1, rate: 200 },
  { year: 2022, fromMonth: 5, rate: 400 },
];

export const MONTH_ORDER = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
] as const;

/** 1-based month number for a month key, or 0 if it isn't one. */
export function monthNumber(monthKey: string): number {
  return MONTH_ORDER.indexOf(String(monthKey).toLowerCase() as any) + 1;
}

/** The charge for one month. `periods` defaults to the built-in schedule. */
export function rateForMonth(
  year: number,
  month: number | string,
  periods: RatePeriod[] = RATE_PERIODS,
): number {
  const m = typeof month === 'number' ? month : monthNumber(month);
  const sorted = [...periods].sort(
    (a, b) => a.year - b.year || a.fromMonth - b.fromMonth,
  );
  let rate = sorted[0]?.rate ?? 200;
  for (const p of sorted) {
    if (year > p.year || (year === p.year && m >= p.fromMonth)) rate = p.rate;
    else break;
  }
  return rate;
}

/** What a whole year costs — months summed, so a mid-year change is included. */
export function chargeForYear(year: number, periods: RatePeriod[] = RATE_PERIODS): number {
  let total = 0;
  for (let m = 1; m <= 12; m++) total += rateForMonth(year, m, periods);
  return total;
}

/** A year's prevailing charge — its December figure — for one-number displays. */
export function prevailingRate(year: number, periods: RatePeriod[] = RATE_PERIODS): number {
  return rateForMonth(year, 12, periods);
}
