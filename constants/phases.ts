export const PHASE_BLOCK_MAP: Record<number, string[]> = {
  1: ['A', 'B', 'K', 'J', 'I', 'H'],
  2: ['C', 'D', 'E', 'F', 'G'],
  3: ['L'],
};

export const BLOCK_PHASE_MAP: Record<string, number> = {
  A: 1, B: 1, K: 1, J: 1, I: 1, H: 1,
  C: 2, D: 2, E: 2, F: 2, G: 2,
  L: 3,
};

export const ALL_BLOCKS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;

export const MONTH_LABELS: Record<string, string> = {
  jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun',
  jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec',
};

export const YEARS_WITH_DATA = [2012, 2013, 2014, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
