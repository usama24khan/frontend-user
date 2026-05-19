"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../utils/api";
import StatCard from "../components/ui/StatCard";
import ProgressBar from "../components/ui/ProgressBar";
import Spinner from "../components/ui/Spinner";

const MONTHS = [
  { key: "jan", label: "Jan" },
  { key: "feb", label: "Feb" },
  { key: "mar", label: "Mar" },
  { key: "apr", label: "Apr" },
  { key: "may", label: "May" },
  { key: "jun", label: "Jun" },
  { key: "jul", label: "Jul" },
  { key: "aug", label: "Aug" },
  { key: "sep", label: "Sep" },
  { key: "oct", label: "Oct" },
  { key: "nov", label: "Nov" },
  { key: "dec", label: "Dec" },
];

const BLOCKS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const formatPKR = (n: number) => {
  return "₨ " + Math.round(n).toLocaleString("en-PK");
};

export default function UserOverviewPage() {
  const [year, setYear] = useState(2026);
  const [monthFrom, setMonthFrom] = useState("jan");
  const [monthTo, setMonthTo] = useState("dec");
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pinned plot state
  const [pinnedPlotId, setPinnedPlotId] = useState<string | null>(null);
  const [pinnedPlotData, setPinnedPlotData] = useState<any>(null);
  const [loadingPinned, setLoadingPinned] = useState(false);

  // Verification form
  const [pinBlock, setPinBlock] = useState("A");
  const [pinNumber, setPinNumber] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  // Initialize pinned plot
  useEffect(() => {
    const saved = localStorage.getItem("kkb4_pinned_plot_id");
    if (saved) {
      setPinnedPlotId(saved);
    }
  }, []);

  // Fetch pinned plot's details
  useEffect(() => {
    if (!pinnedPlotId) {
      setPinnedPlotData(null);
      return;
    }

    const fetchPinnedPlot = async () => {
      setLoadingPinned(true);
      try {
        const res: any = await api.get(`/plots/${pinnedPlotId}`);
        if (res.success) {
          setPinnedPlotData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch pinned plot:", err);
      } finally {
        setLoadingPinned(false);
      }
    };

    fetchPinnedPlot();
  }, [pinnedPlotId, year]);

  // Fetch analytics overview
  useEffect(() => {
    let active = true;
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `/analytics/overview?year=${year}&monthFrom=${monthFrom}&monthTo=${monthTo}`;
        if (selectedBlock) {
          url += `&block=${selectedBlock}`;
        } else if (selectedPhase) {
          url += `&phase=${selectedPhase}`;
        }

        const res: any = await api.get(url);
        if (active && res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics overview:", err);
        setError("Could not load society performance stats.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      active = false;
    };
  }, [year, monthFrom, monthTo, selectedPhase, selectedBlock]);

  // Filters Reset & Toggles
  const handlePhaseChange = (phase: number | null) => {
    setSelectedBlock(null);
    setSelectedPhase(phase);
  };

  const handleBlockChange = (block: string | null) => {
    setSelectedPhase(null);
    setSelectedBlock(block);
  };

  // Pinned plot submission
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    if (!pinNumber.trim()) {
      setPinError("Enter a plot number.");
      return;
    }

    try {
      const res: any = await api.get(
        `/plots?block=${pinBlock}&search=${pinNumber.trim()}&limit=10`,
      );
      if (res.success && res.data) {
        const exactMatch = res.data.find(
          (p: any) =>
            p.plotNumber.toString().trim() === pinNumber.trim() &&
            p.block.toUpperCase() === pinBlock.toUpperCase(),
        );

        if (exactMatch) {
          localStorage.setItem("kkb4_pinned_plot_id", exactMatch._id);
          setPinnedPlotId(exactMatch._id);
          setPinNumber("");
        } else {
          setPinError(`Plot ${pinNumber} not found in Block ${pinBlock}.`);
        }
      }
    } catch (err) {
      setPinError("Verification failed.");
    }
  };

  const handleUnpin = () => {
    localStorage.removeItem("kkb4_pinned_plot_id");
    setPinnedPlotId(null);
    setPinnedPlotData(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Sleek Gradient Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight">
            KKB4 Society Dashboard
          </h1>
          <p className="text-emerald-100 text-sm max-w-xl font-medium">
            Track real-time maintenance rate collection metrics, search property
            registries, and view detailed financial declarations.
          </p>
        </div>

        {/* Dynamic Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 relative z-10 shrink-0 self-start md:self-auto">
          {/* Year selector */}
          <div className="flex items-center gap-2 px-1 text-sm font-semibold">
            <span className="text-emerald-200 uppercase tracking-wider text-[10px]">
              Year
            </span>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer font-bold select-none"
            >
              {[2021, 2022, 2023, 2024, 2025, 2026].map((y) => (
                <option
                  key={y}
                  value={y}
                  className="text-gray-900 font-semibold"
                >
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="w-[1px] h-5 bg-white/20" />

          {/* Month Range Selectors */}
          <div className="flex items-center gap-2 px-1 text-sm font-semibold">
            <span className="text-emerald-200 uppercase tracking-wider text-[10px]">
              From
            </span>
            <select
              value={monthFrom}
              onChange={(e) => setMonthFrom(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer font-bold"
            >
              {MONTHS.map((m) => (
                <option
                  key={m.key}
                  value={m.key}
                  className="text-gray-900 font-semibold"
                >
                  {m.label}
                </option>
              ))}
            </select>

            <span className="text-emerald-200 uppercase tracking-wider text-[10px]">
              To
            </span>
            <select
              value={monthTo}
              onChange={(e) => setMonthTo(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer font-bold"
            >
              {MONTHS.map((m) => (
                <option
                  key={m.key}
                  value={m.key}
                  className="text-gray-900 font-semibold"
                >
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: owner card + quick filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pinned Plot card with custom glassmorphism / styling */}
        <div className="lg:col-span-2 card p-5 relative overflow-hidden flex flex-col justify-between">
          {pinnedPlotId ? (
            loadingPinned || !pinnedPlotData ? (
              <div className="flex justify-center items-center h-48">
                <Spinner size={32} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping shrink-0" />
                      Pinned Plot: {pinnedPlotData.plotBlock}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      Registered Owner:{" "}
                      <span className="font-bold text-gray-800">
                        {pinnedPlotData.ownerName}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge ${
                        pinnedPlotData.allotmentStatus === "Active"
                          ? "badge-green"
                          : "badge-red"
                      }`}
                    >
                      {pinnedPlotData.allotmentStatus}
                    </span>
                    <button
                      onClick={handleUnpin}
                      className="btn btn-outline text-xs px-2.5 py-1"
                    >
                      Change Plot
                    </button>
                  </div>
                </div>

                {/* Plot's Payment Grid with modern circles */}
                <div className="space-y-3.5">
                  {(() => {
                    const payRecord = pinnedPlotData.payments?.find(
                      (p: any) => p.year === year,
                    );
                    const received = payRecord?.totalReceived || 0;
                    const expected = payRecord?.totalDue || 4800;
                    const remaining = Math.max(0, expected - received);
                    const paidCount = MONTHS.filter(
                      (m) => payRecord?.payments?.[m.key] > 0,
                    ).length;

                    return (
                      <>
                        <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          <span>Monthly Payment Calendar — {year}</span>
                          <span className="text-emerald-800 font-bold">
                            Rate:{" "}
                            {payRecord ? formatPKR(payRecord.mcRate) : "₨ 400"}
                            /month
                          </span>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1.5">
                          {MONTHS.map((m) => {
                            const val = payRecord?.payments?.[m.key];
                            const isPaid =
                              val !== null && val !== undefined && val > 0;

                            return (
                              <div
                                key={m.key}
                                className={`month-box ${isPaid ? "paid" : "unpaid"}`}
                              >
                                <span className="uppercase text-[9px] opacity-75 font-bold tracking-wider">
                                  {m.key}
                                </span>
                                <span className="font-bold text-xs mt-1">
                                  {isPaid ? formatPKR(val) : "Pending"}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Totals Summary */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 border border-gray-100 p-3.5 rounded-2xl gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-gray-500">
                              Registry Progress:
                            </span>
                            <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              {paidCount} / 12 Months Paid
                            </span>
                          </div>
                          <div className="flex gap-4">
                            <span className="font-medium text-gray-600">
                              Received:{" "}
                              <span className="font-bold text-emerald-800">
                                {formatPKR(received)}
                              </span>
                            </span>
                            <span className="font-medium text-gray-600">
                              Remaining:{" "}
                              <span className="font-bold text-rose-700">
                                {formatPKR(remaining)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 my-auto">
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-gray-900">
                  Are you a property owner?
                </h3>
                <p className="text-sm text-gray-500 max-w-sm font-medium">
                  Pin your plot details to check your dues, see your payment
                  registers, and track society disclosures.
                </p>
              </div>

              <form
                onSubmit={handlePinSubmit}
                className="w-full md:w-auto flex flex-col gap-2 shrink-0"
              >
                <div className="flex gap-2">
                  <select
                    value={pinBlock}
                    onChange={(e) => setPinBlock(e.target.value)}
                    className="select text-xs font-semibold"
                  >
                    {BLOCKS.map((b) => (
                      <option key={b} value={b}>
                        Block {b}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={pinNumber}
                    onChange={(e) => setPinNumber(e.target.value)}
                    placeholder="Plot Number (e.g. 14)"
                    className="select text-xs font-semibold w-40"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary text-xs px-4 py-2 shrink-0"
                  >
                    Verify & Pin
                  </button>
                </div>
                {pinError && (
                  <p className="text-xs text-rose-600 font-bold">{pinError}</p>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Phase/Block filters in card */}
        <div className="card p-5 flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2 mb-3">
            Society Filters
          </h3>

          <div className="space-y-4">
            {/* Phase Selector */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Phases
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handlePhaseChange(null)}
                  className={`btn text-xs py-1 px-3 ${
                    selectedPhase === null && selectedBlock === null
                      ? "btn-primary"
                      : "btn-outline"
                  }`}
                >
                  All Phases
                </button>
                {[1, 2, 3].map((ph) => (
                  <button
                    key={ph}
                    onClick={() => handlePhaseChange(ph)}
                    className={`btn text-xs py-1 px-3 ${
                      selectedPhase === ph ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    Phase {ph}
                  </button>
                ))}
              </div>
            </div>

            {/* Block Selector */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Blocks
              </span>
              <div className="flex flex-wrap gap-1 max-h-[85px] overflow-y-auto pr-1">
                {BLOCKS.map((b) => (
                  <button
                    key={b}
                    onClick={() => handleBlockChange(b)}
                    className={`px-2 py-0.5 border rounded text-[11px] font-semibold transition-all ${
                      selectedBlock === b
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Block {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics calculations container */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center text-sm text-red-700">
          {error}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                  <path d="M9 21V12h6v9" />
                </svg>
              }
              label="Total Plots"
              value={data.totalPlots}
              delta={`${data.activePlots} Active`}
              color="blue"
            />
            <StatCard
              icon={
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v2m0 6v2M9.5 9.5C9.5 8.67 10.67 8 12 8s2.5.67 2.5 1.5S13.33 11 12 11s-2.5.67-2.5 1.5S10.67 16 12 16s2.5-.67 2.5-1.5" />
                </svg>
              }
              label="Collection Rate"
              value={`${data.collectionRate}%`}
              delta="Progress"
              color="amber"
            />
            <StatCard
              icon={
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label="Total Collected"
              value={formatPKR(data.totalReceived)}
              delta={`Target: ${formatPKR(data.totalDue)}`}
              color="green"
            />
            <StatCard
              icon={
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              label="Total Overdue"
              value={formatPKR(data.totalRemaining)}
              delta="Pending dues"
              color="red"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recharts expected vs actual */}
            <div className="lg:col-span-2 card p-5 flex flex-col justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-50 pb-2 mb-4">
                Expected Dues vs Actual Received
              </h3>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.perMonthBreakdown} barCategoryGap="25%">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(m) => m.toUpperCase()}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${(v / 1_000).toFixed(0)}K`}
                    />
                    <Tooltip
                      formatter={(v: any) => [formatPKR(v), ""]}
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      wrapperStyle={{ fontSize: 12 }}
                    />
                    <Bar
                      dataKey="due"
                      fill="#e2e8f0"
                      radius={[4, 4, 0, 0]}
                      name="Expected Due"
                    />
                    <Bar
                      dataKey="received"
                      fill="#166534"
                      radius={[4, 4, 0, 0]}
                      name="Actual Received"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Block Progressbars Card */}
            <div className="card p-5 flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-50 pb-2 mb-4">
                Block Collection Rates
              </h3>
              <div className="space-y-4.5 flex-1 overflow-y-auto max-h-[300px] pr-1.5">
                {data.perBlockBreakdown.map((row: any) => (
                  <div key={row.block} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                      <span>
                        Block {row.block} (Phase {row.phase})
                      </span>
                      <span className="text-emerald-800 font-extrabold">
                        {row.collectionRate}%
                      </span>
                    </div>
                    <ProgressBar
                      value={row.collectionRate}
                      height={5}
                      showLabel={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
