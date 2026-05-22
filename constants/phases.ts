/**
 * KKB4 Frontend Constants
 *
 * Phase Logic:
 *   Phase 1: Blocks K, L
 *   Phase 2: Blocks I, J
 *   Phase 3: Blocks G, H
 *   Phase 4: Blocks E, F
 *   Phase 5: Blocks C, D
 *   Phase 6: Blocks A, B
 *   Phase P: Block P
 */

export const PHASE_BLOCK_MAP: Record<string, string[]> = {
  'Phase 1': ['K', 'L'],
  'Phase 2': ['I', 'J'],
  'Phase 3': ['G', 'H'],
  'Phase 4': ['E', 'F'],
  'Phase 5': ['C', 'D'],
  'Phase 6': ['A', 'B'],
  'Phase P': ['P'],
};

export const BLOCK_PHASE_MAP: Record<string, string> = {
  K: 'Phase 1', L: 'Phase 1',
  I: 'Phase 2', J: 'Phase 2',
  G: 'Phase 3', H: 'Phase 3',
  E: 'Phase 4', F: 'Phase 4',
  C: 'Phase 5', D: 'Phase 5',
  A: 'Phase 6', B: 'Phase 6',
  P: 'Phase P',
};

export const ALL_BLOCKS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'P'];

export const ALL_PHASES = [
  'Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6', 'Phase P',
];

export const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;

export const MONTH_LABELS: Record<string, string> = {
  jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun',
  jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec',
};

export const MONTH_FULL_LABELS: Record<string, string> = {
  jan: 'January', feb: 'February', mar: 'March', apr: 'April', may: 'May', jun: 'June',
  jul: 'July', aug: 'August', sep: 'September', oct: 'October', nov: 'November', dec: 'December',
};

export const YEARS_WITH_DATA = [
  2012, 2013, 2014, 2015, 2016, 2017,
  2018, 2019, 2020, 2021, 2022, 2023,
  2024, 2025, 2026,
];

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Get the maintenance charge rate for a given year.
 * Years ≤ 2021: PKR 200/month
 * Years ≥ 2022: PKR 400/month
 */
export function getMcRateForYear(year: number): number {
  return year >= 2022 ? 400 : 200;
}

/**
 * Format PKR amount with comma separators.
 */
export function formatPKR(n: number): string {
  return '₨ ' + Math.round(n).toLocaleString('en-PK');
}

/**
 * Get the current month index (1-12) for default filter.
 */
export function getCurrentMonthIndex(): number {
  return new Date().getMonth(); // 0-indexed, but we use MONTHS array which is also 0-indexed
}
