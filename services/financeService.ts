import api from '../utils/api';

/**
 * financeService (resident portal)
 * ===============================
 * Read-only view of the society cash book. The committee records the entries in
 * the admin app; residents see the same figures here, with the bookkeeping
 * internals (who entered a row, uploaded bills) omitted by the API.
 *
 * The figures are grouped by the month money was *received*, not the month it
 * pays for — so a neighbour clearing years of arrears shows up in the month they
 * actually paid. `arrears` / `current` / `advance` break that down.
 */

export interface FinanceOverview {
  currentPeriod: { year: number; month: number; monthKey: string };
  thisMonth: { income: number; expense: number; saving: number };
  totalSaving: number;
  openingBalance: number;
  allTime: { income: number; expense: number; saving: number };
}

export interface ExpenseRow {
  _id: string;
  title: string;
  categoryName: string;
  amount: number;
  expenseDate: string;
  paidTo: string;
  method: string;
  note: string;
}

export interface MonthReport {
  period: { year: number; month: number; monthKey: string; ordinal: number };
  /** True when this is the month the society is currently in. */
  isCurrentPeriod: boolean;
  income: {
    total: number;
    count: number;
    arrears: number;
    current: number;
    advance: number;
    unallocated: number;
  };
  expense: {
    total: number;
    count: number;
    byCategory: Array<{ category: string; amount: number; count: number }>;
  };
  saving: number;
  openingBalance: number;
  closingBalance: number;
  expenses: ExpenseRow[];
  openingAsOf: string;
}

export interface YearMonthRow {
  month: number;
  monthKey: string;
  income: number;
  incomeCount: number;
  arrears: number;
  current: number;
  advance: number;
  expense: number;
  expenseCount: number;
  saving: number;
  runningSaving: number;
}

export interface YearReport {
  year: number;
  openingBalance: number;
  closingBalance: number;
  totals: { income: number; expense: number; saving: number };
  months: YearMonthRow[];
}

export interface YearlyReport {
  openingBalance: number;
  openingAsOf: string;
  totals: { income: number; expense: number; saving: number };
  totalSaving: number;
  years: Array<{
    year: number;
    income: number;
    expense: number;
    saving: number;
    runningSaving: number;
  }>;
}

/** Headline figures: this month's income, spend, surplus, and the savings pool. */
export const getFinanceOverview = async (): Promise<FinanceOverview> => {
  const res: any = await api.get('/finance/overview');
  return res.data;
};

/** One month in full, including every expense line. */
export const getMonthReport = async (year: number, month: number): Promise<MonthReport> => {
  const res: any = await api.get('/finance/summary', { params: { year, month } });
  return res.data;
};

/** The twelve-month table for a year. */
export const getYearReport = async (year: number): Promise<YearReport> => {
  const res: any = await api.get('/finance/year', { params: { year } });
  return res.data;
};

/** Year-by-year history plus all-time totals and the current savings pool. */
export const getYearlyReport = async (): Promise<YearlyReport> => {
  const res: any = await api.get('/finance/yearly');
  return res.data;
};
