"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../utils/api";
import Card from "../../components/ui/Card";
import ProgressBar from "../../components/ui/ProgressBar";
import Spinner from "../../components/ui/Spinner";

import { YEARS_WITH_DATA, getMcRateForYear } from "../../constants/phases";

const formatPKR = (n: number) => {
  return "₨ " + Math.round(n).toLocaleString("en-PK");
};

const TABS = [
  { key: "plots", label: "Top Paid Plots" },
  { key: "blocks", label: "Top Blocks" },
  { key: "defaulters", label: "Defaulters list" },
] as const;

export default function LeaderboardPage() {
  const [year, setYear] = useState(2026);
  const [activeTab, setActiveTab] = useState<"plots" | "blocks" | "defaulters">("plots");
  const [loading, setLoading] = useState(true);
  const [topPlots, setTopPlots] = useState<any[]>([]);
  const [topBlocks, setTopBlocks] = useState<any[]>([]);
  const [defaulters, setDefaulters] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        if (activeTab === "plots") {
          const res: any = await api.get(`/stats/top-plots?year=${year}`);
          if (active && res.success) setTopPlots(res.data || []);
        } else if (activeTab === "blocks") {
          const res: any = await api.get(`/stats/top-blocks?year=${year}`);
          if (active && res.success) setTopBlocks(res.data || []);
        } else if (activeTab === "defaulters") {
          const res: any = await api.get(`/stats/defaulters?year=${year}`);
          if (active && res.success) {
            const zeroPayment = res.data.zeroPayment || [];
            const noRecord = res.data.noRecord || [];
            const rate = getMcRateForYear(year);
            const combined = [
              ...zeroPayment.map((p: any) => ({
                plot: p.plot,
                totalDue: p.totalDue,
              })),
              ...noRecord.map((plot: any) => ({
                plot,
                totalDue: rate * 12,
              })),
            ];
            setDefaulters(combined);
          }
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchLeaderboard();
    return () => {
      active = false;
    };
  }, [year, activeTab]);

  // Styles for rank medals
  const getRankBadgeStyle = (idx: number) => {
    if (idx === 0) return "bg-amber-100 text-amber-800 border-amber-200 font-extrabold"; // Gold
    if (idx === 1) return "bg-slate-200 text-slate-800 border-slate-300 font-extrabold"; // Silver
    if (idx === 2) return "bg-orange-100 text-orange-800 border-orange-200 font-extrabold"; // Bronze
    return "bg-gray-50 text-gray-500 border-gray-100";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Premium Header */}
      <div className="bg-linear-to-r from-emerald-600 to-emerald-700 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Society Rankings</h1>
          <p className="text-emerald-100 text-sm max-w-xl font-medium">
            Compare collection leaders, rank blocks by recovery percentages, and audit overdue registries.
          </p>
        </div>

        {/* Custom Selector Panel */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 relative z-10 shrink-0">
          <span className="text-emerald-200 uppercase tracking-wider text-[10px] font-bold">Reporting Year</span>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="bg-transparent border-none text-white focus:outline-none cursor-pointer font-bold text-sm"
          >
            {[...YEARS_WITH_DATA].reverse().map((y) => (
              <option key={y} value={y} className="text-gray-900 font-semibold">
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs segment controller */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl max-w-md gap-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 text-center py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 ${
              activeTab === t.key
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main card list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        <Card>
          <div className="p-2 space-y-4">
            {/* 1. TOP PLOTS */}
            {activeTab === "plots" && (
              <div className="divide-y divide-gray-100">
                <div className="pb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Highest Paid Plots — {year}
                  </h3>
                </div>

                <div className="pt-2 divide-y divide-gray-100/60 max-h-[500px] overflow-y-auto pr-1">
                  {topPlots.map((item, idx) => (
                    <Link key={idx} href={`/plots/${item.plot._id}`} className="block">
                      <div className="flex items-center justify-between gap-4 py-3 px-2 rounded-2xl hover:bg-gray-50/70 transition-all duration-150">
                        <div className="flex items-center gap-3">
                          {/* Rank badge */}
                          <div
                            className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs shrink-0 ${getRankBadgeStyle(
                              idx
                            )}`}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {item.plot.ownerName}
                            </p>
                            <p className="text-xs text-gray-400 font-semibold mt-0.5">
                              Plot {item.plot.plotBlock} — Phase {item.plot.phase}
                            </p>
                          </div>
                        </div>

                        <span className="text-sm font-extrabold text-emerald-800 shrink-0">
                          {formatPKR(item.totalReceived)}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {topPlots.length === 0 && (
                    <div className="text-center py-12 text-gray-400 font-medium">
                      No plot collections recorded in {year}.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. TOP BLOCKS */}
            {activeTab === "blocks" && (
              <div className="divide-y divide-gray-100">
                <div className="pb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Top Performing Blocks — {year}
                  </h3>
                </div>

                <div className="pt-2 divide-y divide-gray-100/60 max-h-[500px] overflow-y-auto pr-1">
                  {topBlocks.map((item, idx) => (
                    <Link key={idx} href={`/blocks/${item.block}`} className="block">
                      <div className="flex items-center justify-between gap-4 py-3.5 px-2 rounded-2xl hover:bg-gray-50/70 transition-all duration-150">
                        <div className="flex items-center gap-3.5">
                          {/* Rank badge */}
                          <div
                            className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs shrink-0 ${getRankBadgeStyle(
                              idx
                            )}`}
                          >
                            {idx + 1}
                          </div>

                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-100 shrink-0">
                            {item.block}
                          </div>

                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              Block {item.block}
                            </p>
                            <p className="text-xs text-gray-400 font-semibold mt-0.5">
                              Phase {item.phase} — Collection Progress
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 shrink-0">
                          <div className="w-24 hidden sm:block">
                            <ProgressBar value={item.collectionRate} height={4} showLabel={false} />
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-extrabold text-emerald-800 block">
                              {item.collectionRate}%
                            </span>
                            <span className="text-[9px] font-bold text-gray-400 block mt-0.5">
                              {formatPKR(item.totalCollected)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {topBlocks.length === 0 && (
                    <div className="text-center py-12 text-gray-400 font-medium">
                      No block progress data calculated.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. DEFAULTERS */}
            {activeTab === "defaulters" && (
              <div className="divide-y divide-gray-100">
                <div className="pb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Unpaid Property Registry — {year}
                  </h3>
                </div>

                <div className="pt-2 divide-y divide-gray-100/60 max-h-[500px] overflow-y-auto pr-1">
                  {defaulters.map((item, idx) => (
                    <Link key={idx} href={`/plots/${item.plot?._id}`} className="block">
                      <div className="flex items-center justify-between gap-4 py-3 px-2 rounded-2xl hover:bg-gray-50/70 transition-all duration-150">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center shrink-0 border border-rose-100">
                            <svg
                              width="14"
                              height="14"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 9v4m0 4h.01M4.93 19h14.14c1.34 0 2.17-1.46 1.5-2.63L13.5 4.37c-.67-1.17-2.33-1.17-3 0L3.43 16.37c-.67 1.17.16 2.63 1.5 2.63z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {item.plot?.ownerName || "Unknown Owner"}
                            </p>
                            <p className="text-xs text-gray-400 font-semibold mt-0.5">
                              Plot {item.plot?.plotBlock || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <span className="badge badge-red text-[9px] font-bold px-2 py-0.5">
                            {item.plot?.allotmentStatus || "Active"}
                          </span>
                          <span className="text-sm font-extrabold text-rose-800">
                            {formatPKR(item.totalDue)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {defaulters.length === 0 && (
                    <div className="text-center py-12 text-gray-400 font-medium">
                      Excellent! Zero unpaid plots detected.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
