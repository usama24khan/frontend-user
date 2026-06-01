/**
 * KKB4 Frontend Constants
 *
 * Phase Logic:
 *   Phase 1: Blocks A, B, H, I, J, K
 *   Phase 2: Blocks C, D, E, F, G
 *   Phase 3: Block  L
 *   Phase P: Block  P (legacy)
 */

export const PHASE_BLOCK_MAP: Record<string, string[]> = {
  'Phase 1': ['A', 'B', 'H', 'I', 'J', 'K'],
  'Phase 2': ['C', 'D', 'E', 'F', 'G'],
  'Phase 3': ['L'],
  'Phase P': ['P'],
};

export const BLOCK_PHASE_MAP: Record<string, string> = {
  A: 'Phase 1', B: 'Phase 1', H: 'Phase 1', I: 'Phase 1', J: 'Phase 1', K: 'Phase 1',
  C: 'Phase 2', D: 'Phase 2', E: 'Phase 2', F: 'Phase 2', G: 'Phase 2',
  L: 'Phase 3',
  P: 'Phase P',
};

export const ALL_BLOCKS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'P'];

export const ALL_PHASES = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase P'];

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
