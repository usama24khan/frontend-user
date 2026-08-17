"use client";

/**
 * Accounts (resident view) — where the society's money went.
 *
 * Read-only counterpart to the admin cash book: the same income, expenses and
 * savings figures residents' maintenance charges add up to, with every expense
 * line shown rather than a summary, so the accounts can be checked rather than
 * merely announced.
 *
 * Income is grouped by the month it was received. A neighbour clearing years of
 * arrears counts in the month they actually paid, which is why the breakdown
 * separates late dues, the current month, and payments made in advance.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getMonthReport,
  getYearReport,
  getYearlyReport,
  type MonthReport,
  type YearReport,
  type YearlyReport,
  type YearMonthRow,
} from "../../services";

const MONTH_KEYS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 2011 }, (_, i) => CURRENT_YEAR - i);
const EARLIEST_YEAR = 2012;

/** Amounts always carry their sign next to the numeral, never floating apart. */
const formatPKR = (n: number) =>
  (n < 0 ? "−₨ " : "₨ ") + Math.abs(Math.round(n || 0)).toLocaleString("en-PK");

/** In a dense table an empty month reads better as a dash than as "₨ 0". */
const money = (n: number) => (n ? formatPKR(n) : "—");

type Tab = "month" | "year" | "history";

export default function ResidentFinancePage() {
  const { t, i18n } = useTranslation();

  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [tab, setTab] = useState<Tab>("month");

  const [monthData, setMonthData] = useState<MonthReport | null>(null);
  const [yearData, setYearData] = useState<YearReport | null>(null);
  const [yearlyData, setYearlyData] = useState<YearlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, y, all] = await Promise.all([
        getMonthReport(year, month),
        getYearReport(year),
        getYearlyReport(),
      ]);
      setMonthData(m);
      setYearData(y);
      setYearlyData(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("finance.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [year, month, t]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener("kkb4-refresh", handler);
    return () => window.removeEventListener("kkb4-refresh", handler);
  }, [load]);

  const chartData = useMemo(
    () =>
      (yearData?.months || []).map((m) => ({
        month: t(`months.short.${m.monthKey}`),
        income: m.income,
        expense: m.expense,
        saving: m.runningSaving,
      })),
    [yearData, t]
  );

  const monthLabel = t(`months.long.${MONTH_KEYS[month - 1]}`, {
    defaultValue: t(`months.short.${MONTH_KEYS[month - 1]}`),
  });

  const isRtl = i18n.dir() === "rtl";

  /** Move one month, rolling across the year boundary and clamping to the range. */
  const step = (delta: number) => {
    const next = month + delta;
    if (next < 1) {
      if (year - 1 < EARLIEST_YEAR) return;
      setYear(year - 1);
      setMonth(12);
    } else if (next > 12) {
      if (year + 1 > CURRENT_YEAR) return;
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(next);
    }
  };

  return (
    <div className="p-4 sm:p-5 max-w-350 mx-auto fade-in">
      <div className="card p-5 mb-4">
        <div className="page-eyebrow">
          <div className="page-eyebrow-dot" />
          <span className="page-eyebrow-text">{t("finance.eyebrow")}</span>
        </div>
        <h1 className="text-heading">{t("finance.title")}</h1>
        <p className="text-[13px] text-gray-500 mt-1">{t("finance.residentSubtitle")}</p>
      </div>

      {/* Period */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <Field label={t("common.year")}>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="select w-auto min-w-24 cursor-pointer tabular-nums"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </Field>
          {/* Arrows beat a twelve-item picker on a phone, and "show me last
              month" is what people actually want here. */}
          <Field label={t("common.month")}>
            <div className="flex items-stretch gap-1.5">
              <StepButton label={isRtl ? "›" : "‹"} title={t("finance.prevMonth")} onClick={() => step(-1)} />
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="select w-auto min-w-24 cursor-pointer"
              >
                {MONTH_KEYS.map((m, i) => (
                  <option key={m} value={i + 1}>{t(`months.short.${m}`)}</option>
                ))}
              </select>
              <StepButton label={isRtl ? "‹" : "›"} title={t("finance.nextMonth")} onClick={() => step(1)} />
            </div>
          </Field>
        </div>
      </div>

      {loading ? (
        <LoadingState label={t("common.loading")} />
      ) : error ? (
        <ErrorState
          title={t("finance.errorTitle")}
          message={error}
          onRetry={load}
          retryLabel={t("common.tryAgain")}
        />
      ) : monthData && yearData && yearlyData ? (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Kpi
              label={t("finance.kpi.received", { month: monthLabel })}
              value={formatPKR(monthData.income.total)}
              tone="green"
              delta={t("finance.kpi.paymentsCount", { count: monthData.income.count })}
            />
            <Kpi
              label={t("finance.kpi.spent", { month: monthLabel })}
              value={formatPKR(monthData.expense.total)}
              tone="red"
              delta={t("finance.kpi.expensesCount", { count: monthData.expense.count })}
            />
            <Kpi
              label={t("finance.kpi.monthSaving")}
              value={formatPKR(monthData.saving)}
              tone={monthData.saving >= 0 ? "green" : "red"}
              delta={monthData.saving >= 0 ? t("finance.kpi.surplus") : t("finance.kpi.deficit")}
            />
            {/* Savings as at the end of the selected month, not an all-time
                figure — see the admin page for why. */}
            <Kpi
              label={t("finance.kpi.totalSaving")}
              value={formatPKR(monthData.closingBalance)}
              tone={monthData.closingBalance >= 0 ? "green" : "red"}
              delta={
                monthData.isCurrentPeriod
                  ? t("finance.kpi.poolHint")
                  : t("finance.kpi.asOfEnd", { month: monthLabel })
              }
            />
          </div>

          <div className="flex items-center gap-1 border-b border-gray-200">
            {(["month", "year", "history"] as Tab[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`px-4 py-2.5 text-[13px] font-bold cursor-pointer border-b-2 -mb-px transition ${
                  tab === key
                    ? "border-emerald-500 text-emerald-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t(`finance.tabs.${key}`)}
              </button>
            ))}
          </div>

          {tab === "month" && (
            <>
              <div className="card p-5">
                <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-gray-500 mb-4">
                  {t("finance.incomeBreakdown")}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MiniStat label={t("finance.split.arrears")} value={formatPKR(monthData.income.arrears)} hint={t("finance.split.arrearsHint")} />
                  <MiniStat label={t("finance.split.current")} value={formatPKR(monthData.income.current)} hint={t("finance.split.currentHint")} />
                  <MiniStat label={t("finance.split.advance")} value={formatPKR(monthData.income.advance)} hint={t("finance.split.advanceHint")} />
                  <MiniStat label={t("finance.split.other")} value={formatPKR(monthData.income.unallocated)} hint={t("finance.split.otherHint")} />
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-[12.5px]">
                  <BalanceLine label={t("finance.openingForMonth")} value={formatPKR(monthData.openingBalance)} />
                  <BalanceLine
                    label={t("finance.monthSaving")}
                    value={formatPKR(monthData.saving)}
                    tone={monthData.saving >= 0 ? "green" : "red"}
                  />
                  <BalanceLine label={t("finance.closingForMonth")} value={formatPKR(monthData.closingBalance)} strong />
                </div>
              </div>

              <div className="card p-0 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-gray-500">
                    {t("finance.expensesFor", { month: monthLabel, year })}
                  </h2>
                  <span className="text-[12.5px] font-extrabold text-rose-700 tabular-nums">
                    {formatPKR(monthData.expense.total)}
                  </span>
                </div>
                {monthData.expenses.length === 0 ? (
                  <p className="py-14 text-center text-[13px] text-gray-500 font-medium">
                    {t("finance.noExpenses")}
                  </p>
                ) : (
                  <>
                  {/* Phones get stacked cards: in a table the amount ends up off
                      screen behind a sideways scroll, and the amount is the whole
                      reason a resident opened this page. */}
                  <ul className="sm:hidden divide-y divide-gray-100 list-none p-0 m-0">
                    {monthData.expenses.map((row) => (
                      <li key={row._id} className="px-4 py-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[13.5px] font-extrabold text-gray-900 leading-snug">{row.title}</p>
                          <span className="text-[14px] font-extrabold tabular-nums text-rose-700 whitespace-nowrap">
                            {formatPKR(row.amount)}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-gray-500 mt-1 font-medium">
                          {[row.categoryName, row.paidTo, String(row.expenseDate).slice(0, 10)]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>{t("finance.th.title")}</th>
                          <th>{t("finance.th.category")}</th>
                          <th>{t("finance.th.paidTo")}</th>
                          <th>{t("finance.th.date")}</th>
                          <th style={{ textAlign: "right" }}>{t("finance.th.amount")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthData.expenses.map((row) => (
                          <tr key={row._id}>
                            <td className="font-extrabold text-gray-900">{row.title}</td>
                            <td className="text-gray-600 font-semibold">{row.categoryName || "—"}</td>
                            <td className="text-gray-600">{row.paidTo || "—"}</td>
                            <td className="text-gray-500 tabular-nums whitespace-nowrap">
                              {String(row.expenseDate).slice(0, 10)}
                            </td>
                            <td className="text-right font-extrabold tabular-nums text-rose-700 whitespace-nowrap">
                              {formatPKR(row.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </>
                )}
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40">
                  <p className="text-[11px] text-gray-400">{t("finance.publicNote")}</p>
                </div>
              </div>
            </>
          )}

          {tab === "year" && (
            <>
              <div className="card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h2 className="text-[15px] font-extrabold text-gray-900 tracking-tight">
                    {t("finance.chartTitle")} — {year}
                  </h2>
                  <div className="flex items-center gap-3 text-[11.5px] text-gray-600 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> {t("finance.received")}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" /> {t("finance.spent")}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-4 h-0.5 bg-blue-500" /> {t("finance.runningSaving")}
                    </span>
                  </div>
                </div>
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer width="99%" height="100%">
                    <ComposedChart data={chartData} barCategoryGap="22%" margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                      <YAxis
                        width={40}
                        tick={{ fontSize: 10, fill: "#64748B" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1_000).toFixed(0)}K`}
                      />
                      <Tooltip
                        formatter={(v: any) => [formatPKR(v), ""]}
                        contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 12, fontWeight: 600 }}
                        cursor={{ fill: "rgba(16, 185, 129, 0.05)" }}
                      />
                      <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" fill="#FB7185" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="saving" stroke="#3B82F6" strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card p-0 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-gray-500">
                    {t("finance.monthTable", { year })}
                  </h2>
                </div>
                {/* Phone layout: one card per month. Five numeric columns in a
                    table pushed Total Savings — the figure people came for — off
                    the right edge. */}
                <ul className="sm:hidden divide-y divide-gray-100 list-none p-0 m-0">
                  {yearData.months.map((row) => (
                    <MonthRowMobile
                      key={row.month}
                      row={row}
                      selected={row.month === month}
                      label={t(`months.long.${row.monthKey}`, { defaultValue: t(`months.short.${row.monthKey}`) })}
                      savedLabel={t("finance.saved")}
                      quietLabel={t("finance.noActivity")}
                      onSelect={() => { setMonth(row.month); setTab("month"); }}
                    />
                  ))}
                  <li className="px-4 py-3 bg-gray-50 flex items-center justify-between gap-3">
                    <span className="text-[12px] font-extrabold uppercase tracking-wider text-gray-500">
                      {t("finance.total")}
                    </span>
                    <span className="text-[13.5px] font-extrabold tabular-nums text-gray-900">
                      {formatPKR(yearData.closingBalance)}
                    </span>
                  </li>
                </ul>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="data-table data-table-sticky-first">
                    <thead>
                      <tr>
                        <th>{t("common.month")}</th>
                        <th style={{ textAlign: "right" }}>{t("finance.received")}</th>
                        <th style={{ textAlign: "right" }}>{t("finance.spent")}</th>
                        <th style={{ textAlign: "right" }}>{t("finance.saved")}</th>
                        <th style={{ textAlign: "right" }}>{t("finance.runningSaving")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearData.months.map((row) => (
                        <tr
                          key={row.month}
                          className={row.month === month ? "bg-emerald-50/40" : undefined}
                          onClick={() => { setMonth(row.month); setTab("month"); }}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="font-extrabold text-gray-900">{t(`months.short.${row.monthKey}`)}</td>
                          <td className="text-right tabular-nums text-emerald-700 font-bold">{formatPKR(row.income)}</td>
                          <td className="text-right tabular-nums text-rose-700 font-bold">{formatPKR(row.expense)}</td>
                          <td className={`text-right tabular-nums font-bold ${row.saving >= 0 ? "text-gray-900" : "text-rose-700"}`}>
                            {formatPKR(row.saving)}
                          </td>
                          <td className="text-right tabular-nums font-extrabold text-gray-900">{formatPKR(row.runningSaving)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-extrabold">
                        <td>{t("finance.total")}</td>
                        <td className="text-right tabular-nums text-emerald-700">{formatPKR(yearData.totals.income)}</td>
                        <td className="text-right tabular-nums text-rose-700">{formatPKR(yearData.totals.expense)}</td>
                        <td className="text-right tabular-nums">{formatPKR(yearData.totals.saving)}</td>
                        <td className="text-right tabular-nums">{formatPKR(yearData.closingBalance)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}

          {tab === "history" && (
            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-gray-500">
                  {t("finance.allYears")}
                </h2>
              </div>
              {yearlyData.years.length === 0 ? (
                <p className="py-14 text-center text-[13px] text-gray-500 font-medium">{t("finance.noHistory")}</p>
              ) : (
                <>
                <ul className="sm:hidden divide-y divide-gray-100 list-none p-0 m-0">
                  {yearlyData.years.map((row) => (
                    <li key={row.year}>
                      <button
                        type="button"
                        onClick={() => { setYear(row.year); setTab("year"); }}
                        className="w-full text-left px-4 py-3 bg-transparent border-none cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[14px] font-extrabold text-gray-900 tabular-nums">{row.year}</span>
                          <span className={`text-[13.5px] font-extrabold tabular-nums ${row.runningSaving >= 0 ? "text-gray-900" : "text-rose-700"}`}>
                            {formatPKR(row.runningSaving)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11.5px] font-semibold">
                          <span className="text-emerald-700 tabular-nums">↓ {money(row.income)}</span>
                          <span className="text-rose-700 tabular-nums">↑ {money(row.expense)}</span>
                          <span className={`tabular-nums ms-auto ${row.saving >= 0 ? "text-gray-500" : "text-rose-600"}`}>
                            {t("finance.saved")} {money(row.saving)}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                  <li className="px-4 py-3 bg-gray-50 flex items-center justify-between gap-3">
                    <span className="text-[12px] font-extrabold uppercase tracking-wider text-gray-500">
                      {t("finance.allTime")}
                    </span>
                    <span className="text-[13.5px] font-extrabold tabular-nums text-gray-900">
                      {formatPKR(yearlyData.totalSaving)}
                    </span>
                  </li>
                </ul>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="data-table data-table-sticky-first">
                    <thead>
                      <tr>
                        <th>{t("common.year")}</th>
                        <th style={{ textAlign: "right" }}>{t("finance.received")}</th>
                        <th style={{ textAlign: "right" }}>{t("finance.spent")}</th>
                        <th style={{ textAlign: "right" }}>{t("finance.saved")}</th>
                        <th style={{ textAlign: "right" }}>{t("finance.runningSaving")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyData.years.map((row) => (
                        <tr key={row.year} onClick={() => { setYear(row.year); setTab("year"); }} style={{ cursor: "pointer" }}>
                          <td className="font-extrabold text-gray-900 tabular-nums">{row.year}</td>
                          <td className="text-right tabular-nums text-emerald-700 font-bold">{formatPKR(row.income)}</td>
                          <td className="text-right tabular-nums text-rose-700 font-bold">{formatPKR(row.expense)}</td>
                          <td className={`text-right tabular-nums font-bold ${row.saving >= 0 ? "text-gray-900" : "text-rose-700"}`}>
                            {formatPKR(row.saving)}
                          </td>
                          <td className="text-right tabular-nums font-extrabold text-gray-900">{formatPKR(row.runningSaving)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-extrabold">
                        <td>{t("finance.allTime")}</td>
                        <td className="text-right tabular-nums text-emerald-700">{formatPKR(yearlyData.totals.income)}</td>
                        <td className="text-right tabular-nums text-rose-700">{formatPKR(yearlyData.totals.expense)}</td>
                        <td className="text-right tabular-nums">{formatPKR(yearlyData.totals.saving)}</td>
                        <td className="text-right tabular-nums">{formatPKR(yearlyData.totalSaving)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* helpers */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10.5px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
      {children}
    </div>
  );
}

/**
 * One month in the phone-width year list.
 *
 * A month with no money in or out is drawn as a single quiet line: its running
 * balance is just the pool carried forward, and giving it the same weight as a
 * real month made five empty months look like five ₨50,000 receipts.
 */
function MonthRowMobile({
  row,
  selected,
  label,
  savedLabel,
  quietLabel,
  onSelect,
}: {
  row: YearMonthRow;
  selected: boolean;
  label: string;
  savedLabel: string;
  quietLabel: string;
  onSelect: () => void;
}) {
  const quiet = !row.income && !row.expense;

  if (quiet) {
    return (
      <li>
        <button
          type="button"
          onClick={onSelect}
          className={`w-full text-left px-4 py-2 bg-transparent border-none cursor-pointer flex items-center justify-between gap-3 ${
            selected ? "bg-emerald-50/60" : ""
          }`}
        >
          <span className="text-[12px] font-bold text-gray-400">{label}</span>
          <span className="text-[11px] text-gray-300 font-semibold">{quietLabel}</span>
        </button>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`w-full text-left px-4 py-3 bg-transparent border-none cursor-pointer ${
          selected ? "bg-emerald-50/60" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13.5px] font-extrabold text-gray-900">{label}</span>
          <span
            className={`text-[13.5px] font-extrabold tabular-nums ${
              row.runningSaving >= 0 ? "text-gray-900" : "text-rose-700"
            }`}
          >
            {formatPKR(row.runningSaving)}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[11.5px] font-semibold">
          <span className="text-emerald-700 tabular-nums">↓ {money(row.income)}</span>
          <span className="text-rose-700 tabular-nums">↑ {money(row.expense)}</span>
          <span className={`tabular-nums ms-auto ${row.saving >= 0 ? "text-gray-500" : "text-rose-600"}`}>
            {savedLabel} {money(row.saving)}
          </span>
        </div>
      </button>
    </li>
  );
}

/** Previous / next month arrow, sized as a comfortable thumb target. */
function StepButton({ label, title, onClick }: { label: string; title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="w-9 rounded-xl border border-gray-300 bg-white text-gray-600 text-[17px] font-bold leading-none cursor-pointer hover:border-emerald-400 hover:text-emerald-600 transition"
    >
      {label}
    </button>
  );
}

function Kpi({
  label,
  value,
  tone = "neutral",
  delta,
}: {
  label: string;
  value: string | number;
  tone?: "neutral" | "green" | "red";
  delta?: string;
}) {
  const valueTone =
    tone === "green" ? "text-emerald-700" : tone === "red" ? "text-rose-700" : "text-gray-900";
  return (
    <div className="stat-card">
      <div className="text-[10.5px] font-bold uppercase tracking-widest text-gray-500">{label}</div>
      <div className={`text-[19px] font-extrabold tabular-nums mt-1.5 ${valueTone}`}>{value}</div>
      {delta && <div className="text-[11px] text-gray-400 font-medium mt-0.5">{delta}</div>}
    </div>
  );
}

function MiniStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-3">
      <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
      <p className="text-[15px] font-extrabold text-gray-900 tabular-nums mt-1">{value}</p>
      {hint && <p className="text-[10.5px] text-gray-400 mt-0.5 leading-snug">{hint}</p>}
    </div>
  );
}

function BalanceLine({
  label,
  value,
  tone,
  strong,
}: {
  label: string;
  value: string;
  tone?: "green" | "red";
  strong?: boolean;
}) {
  const cls = tone === "green" ? "text-emerald-700" : tone === "red" ? "text-rose-700" : "text-gray-900";
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-gray-500 font-semibold">{label}</span>
      <span className={`tabular-nums ${strong ? "font-extrabold" : "font-bold"} ${cls}`}>{value}</span>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="card flex flex-col items-center justify-center py-20 gap-3">
      <span className="inline-block w-9 h-9 rounded-full border-2 border-gray-200 border-t-emerald-500 animate-spin" />
      <p className="text-[12.5px] text-gray-500 font-medium">{label}</p>
    </div>
  );
}

function ErrorState({
  title,
  message,
  onRetry,
  retryLabel,
}: {
  title: string;
  message: string;
  onRetry: () => void;
  retryLabel: string;
}) {
  return (
    <div className="card p-8 text-center">
      <p className="text-[14px] font-extrabold text-gray-900">{title}</p>
      <p className="text-[13px] text-gray-500 mt-1">{message}</p>
      <button type="button" className="btn btn-outline btn-sm mt-4" onClick={onRetry}>{retryLabel}</button>
    </div>
  );
}
