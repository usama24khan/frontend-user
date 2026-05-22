"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "../../../utils/api";
import Card from "../../../components/ui/Card";
import ProgressBar from "../../../components/ui/ProgressBar";
import Spinner from "../../../components/ui/Spinner";
import { YEARS_WITH_DATA } from "../../../constants/phases";

const formatPKR = (n: number) => {
  return "₨ " + Math.round(n).toLocaleString("en-PK");
};

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

export default function PlotDetailPage() {
  const { plotId } = useParams();
  const [plot, setPlot] = useState<any>(null);
  const [year, setYear] = useState(2026);
  const [allYears, setAllYears] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchPlot = async () => {
      setLoading(true);
      try {
        const res: any = await api.get(`/plots/${plotId}`);
        if (active && res.success) {
          setPlot(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch plot detail:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    if (plotId) {
      fetchPlot();
    }
    return () => {
      active = false;
    };
  }, [plotId]);

  if (loading) return <Spinner />;
  if (!plot) {
    return (
      <div className="p-12 text-center text-gray-500 font-semibold">
        Plot record not found.
      </div>
    );
  }

  const payments = plot.payments || [];
  const sel = payments.find((p: any) => p.year === year);
  const totPaid = payments.reduce((s: number, p: any) => s + (p.totalReceived || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Premium Header Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-white/20 text-white font-extrabold px-3 py-1 rounded-xl text-xs uppercase tracking-wider">
              {plot.plotBlock}
            </span>
            <span className="bg-emerald-900/40 text-emerald-100 font-semibold px-3 py-1 rounded-xl text-xs uppercase tracking-wider">
              Block {plot.block} — Phase {plot.phase}
            </span>
            <span
              className={`badge py-1 px-3 text-[9px] font-bold ${
                plot.allotmentStatus === "Active"
                  ? "badge-green"
                  : "badge-red"
              }`}
            >
              {plot.allotmentStatus}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">{plot.ownerName}</h1>
          <p className="text-emerald-100 text-sm max-w-xl font-medium mt-1">
            Society Property Registry File detail and collection log.
          </p>
        </div>

        {/* Lifetime Paid counter */}
        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 relative z-10 shrink-0 self-start md:self-auto">
          <span className="text-emerald-200 uppercase tracking-wider text-[9px] font-bold block mb-1">
            Lifetime Paid
          </span>
          <span className="text-xl font-extrabold text-white block">
            {formatPKR(totPaid)}
          </span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Side: Selectors */}
        <div className="flex items-center gap-3">
          {!allYears && (
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="select text-xs font-semibold"
            >
              {[...YEARS_WITH_DATA].reverse().map((y) => (
                <option key={y} value={y}>
                  Year: {y}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setAllYears(!allYears)}
            className={`btn text-xs font-semibold ${
              allYears ? "btn-primary" : "btn-outline"
            }`}
          >
            {allYears ? "✓ Showing All History" : "View Full History"}
          </button>
        </div>
      </div>

      {/* Details Container */}
      {!allYears ? (
        sel ? (
          <div className="card p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Monthly Payment Calendar — {year}
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl">
                Rate: {formatPKR(sel.mcRate)}/month
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {MONTHS.map((m) => {
                const val = sel.payments?.[m.key] || 0;
                const isPaid = val > 0;
                const isFull = val >= sel.mcRate;

                return (
                  <div
                    key={m.key}
                    className={`month-box transition-all ${
                      isFull ? "paid" : isPaid ? "partial" : "unpaid"
                    }`}
                  >
                    <span className="uppercase text-[9px] opacity-75 font-bold tracking-wider">{m.label}</span>
                    <span className="font-extrabold text-xs mt-1">
                      {isPaid ? formatPKR(val) : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Financial indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: "Expected Due",
                  val: formatPKR(sel.totalDue),
                  color: "text-gray-900",
                  bg: "bg-gray-50/50 border-gray-100",
                },
                {
                  label: "Total Collected",
                  val: formatPKR(sel.totalReceived),
                  color: "text-emerald-800",
                  bg: "bg-emerald-50/50 border-emerald-100",
                },
                {
                  label: "Outstanding Overdue",
                  val: formatPKR(sel.remaining),
                  color: "text-rose-800",
                  bg: "bg-rose-50/50 border-rose-100",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className={`p-4 rounded-2xl border ${m.bg} flex flex-col justify-between h-[80px]`}
                >
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {m.label}
                  </span>
                  <span className={`text-base font-extrabold ${m.color} mt-1`}>{m.val}</span>
                </div>
              ))}
            </div>

            {/* Progress status */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>Annual Payment Progress</span>
                <span className="text-emerald-800">
                  {Math.round((sel.totalReceived / sel.totalDue) * 100)}% Complete
                </span>
              </div>
              <ProgressBar value={sel.totalReceived} max={sel.totalDue} height={6} />
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center text-gray-500 font-semibold">
            No payment record found for the reporting period {year}.
          </div>
        )
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div className="p-5 border-b border-gray-50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Annual Dues History
            </h3>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                {["Year", "Monthly Rate", "Total Due", "Total Received", "Outstanding", "Status %"].map(
                  (h) => (
                    <th key={h}>{h}</th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any) => {
                const pct = p.totalDue > 0 ? Math.round((p.totalReceived / p.totalDue) * 100) : 0;
                return (
                  <tr
                    key={p.year}
                    onClick={() => {
                      setYear(p.year);
                      setAllYears(false);
                    }}
                    className="cursor-pointer"
                  >
                    <td className="font-extrabold text-gray-800">{p.year}</td>
                    <td className="text-gray-500 font-semibold">{formatPKR(p.mcRate)}</td>
                    <td className="text-gray-500 font-semibold">{formatPKR(p.totalDue)}</td>
                    <td className="font-bold text-emerald-800">{formatPKR(p.totalReceived)}</td>
                    <td className="font-bold text-rose-800">{formatPKR(p.remaining)}</td>
                    <td>
                      <span
                        className={`badge text-[9px] font-bold ${
                          pct >= 90
                            ? "badge-green"
                            : pct >= 50
                            ? "badge-amber"
                            : "badge-red"
                        }`}
                      >
                        {pct}% Paid
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
