"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../utils/api";
import ProgressBar from "../../components/ui/ProgressBar";
import Spinner from "../../components/ui/Spinner";

import { YEARS_WITH_DATA } from "../../constants/phases";

const formatPKR = (n: number) => {
  return "₨ " + Math.round(n).toLocaleString("en-PK");
};

// Rich gradients and color styling for each phase
const PHASE_THEMES: Record<string, {
  text: string;
  badgeBg: string;
  progressBarColor: string;
  glow: string;
}> = {
  'Phase 1': {
    text: "text-emerald-800",
    badgeBg: "from-emerald-800 to-green-600",
    progressBarColor: "#166534",
    glow: "rgba(22,101,52,0.05)",
  },
  'Phase 2': {
    text: "text-blue-800",
    badgeBg: "from-blue-800 to-indigo-600",
    progressBarColor: "#1e40af",
    glow: "rgba(30,64,175,0.05)",
  },
  'Phase 3': {
    text: "text-amber-800",
    badgeBg: "from-amber-800 to-orange-600",
    progressBarColor: "#92400e",
    glow: "rgba(146,64,14,0.05)",
  },
  'Phase 4': {
    text: "text-purple-800",
    badgeBg: "from-purple-800 to-violet-600",
    progressBarColor: "#6b21a8",
    glow: "rgba(107,33,168,0.05)",
  },
  'Phase 5': {
    text: "text-rose-800",
    badgeBg: "from-rose-800 to-pink-600",
    progressBarColor: "#9f1239",
    glow: "rgba(159,18,57,0.05)",
  },
  'Phase 6': {
    text: "text-teal-800",
    badgeBg: "from-teal-800 to-cyan-600",
    progressBarColor: "#115e59",
    glow: "rgba(17,94,89,0.05)",
  },
  'Phase P': {
    text: "text-sky-800",
    badgeBg: "from-sky-800 to-blue-600",
    progressBarColor: "#075985",
    glow: "rgba(7,89,133,0.05)",
  },
};

export default function PhasesPage() {
  const [year, setYear] = useState(2026);
  const [phases, setPhases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchPhases = async () => {
      setLoading(true);
      try {
        const res: any = await api.get(`/phases?year=${year}`);
        if (active && res.success) {
          setPhases(res.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch phases:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchPhases();
    return () => {
      active = false;
    };
  }, [year]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Premium Header */}
      <div className="bg-linear-to-r from-emerald-600 to-emerald-700 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Phase Performance</h1>
          <p className="text-emerald-100 text-sm max-w-xl font-medium">
            View society breakdown by phases, track block collection summaries, and analyze recovery metrics.
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

      {/* Main Listing */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {phases.map((phase) => {
            const theme = PHASE_THEMES[phase.phase] || PHASE_THEMES['Phase 1'];
            return (
              <div
                key={phase.phase}
                className="card p-6 relative overflow-hidden flex flex-col gap-5"
                style={{
                  boxShadow: `0 10px 30px -15px ${theme.glow}, 0 1px 3px rgba(0,0,0,0.03)`,
                }}
              >
                {/* Visual Accent */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${theme.badgeBg}`}
                />

                {/* Info Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    {/* Glowing Phase Badge */}
                    <div
                      className={`w-20 h-14 rounded-2xl bg-linear-to-tr ${theme.badgeBg} text-white flex items-center justify-center font-extrabold text-sm shadow-md shrink-0 px-2`}
                    >
                      {phase.phase}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{phase.phase} Overview</h3>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">
                        Blocks registered:{" "}
                        <span className="text-gray-600">
                          {(phase.blockStats || []).map((b: any) => b.block).join(", ")}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Total Rate Display */}
                  <div className="text-left sm:text-right shrink-0">
                    <p className={`text-3xl font-black ${theme.text}`}>{phase.collectionRate}%</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Collection Rate
                    </p>
                  </div>
                </div>

                {/* Custom Progress bar */}
                <ProgressBar value={phase.collectionRate} height={6} showLabel={false} />

                {/* 4 KPI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-2">
                  {[
                    {
                      label: "Total Plots",
                      val: phase.totalPlots,
                      color: "text-blue-900",
                      bg: "bg-blue-50/50 border-blue-100",
                    },
                    {
                      label: "Collected Amount",
                      val: formatPKR(phase.totalCollected),
                      color: "text-emerald-900",
                      bg: "bg-emerald-50/50 border-emerald-100",
                    },
                    {
                      label: "Total Dues",
                      val: formatPKR(phase.totalDue),
                      color: "text-gray-900",
                      bg: "bg-gray-50/50 border-gray-100",
                    },
                    {
                      label: "Outstanding Overdue",
                      val: formatPKR(phase.remaining),
                      color: "text-rose-900",
                      bg: "bg-rose-50/50 border-rose-100",
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className={`p-3.5 rounded-2xl border ${m.bg} flex flex-col justify-between h-[76px] transition-all hover:shadow-sm`}
                    >
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        {m.label}
                      </span>
                      <span className={`text-base font-extrabold ${m.color} mt-1`}>{m.val}</span>
                    </div>
                  ))}
                </div>

                {/* Blocks Breakdown Grid */}
                {phase.blockStats && phase.blockStats.length > 0 && (
                  <div className="mt-2 space-y-3">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Individual Block Status
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {phase.blockStats.map((bs: any) => (
                        <Link key={bs.block} href={`/blocks/${bs.block}`} className="block">
                          <div className="p-3 bg-gray-50/50 hover:bg-white rounded-2xl border border-gray-100 hover:border-gray-200/80 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-extrabold text-gray-800">
                                Block {bs.block}
                              </span>
                              <span className={`text-xs font-bold ${theme.text}`}>
                                {bs.collectionRate}%
                              </span>
                            </div>
                            <ProgressBar value={bs.collectionRate} height={4} showLabel={false} />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
