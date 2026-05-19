"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Card from "../../../components/ui/Card";
import StatCard from "../../../components/ui/StatCard";
import ProgressBar from "../../../components/ui/ProgressBar";
import Spinner from "../../../components/ui/Spinner";
import api from "../../../utils/api";
import { BLOCK_PHASE_MAP } from "../../../constants/phases";

const formatPKR = (n: number) => {
  return "₨ " + Math.round(n).toLocaleString("en-PK");
};

export default function BlockDetailPage() {
  const params = useParams();
  const block = (params.block as string)?.toUpperCase();
  const [year, setYear] = useState(2026);
  const [plots, setPlots] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchBlockDetails = async () => {
      setLoading(true);
      try {
        const res: any = await api.get(`/blocks/${block}?year=${year}`);
        if (active && res.success) {
          setPlots(res.data.plots || []);
          setStats(res.data.stats || null);
        }
      } catch (err) {
        console.error("Failed to fetch block details:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    if (block) {
      fetchBlockDetails();
    }
    return () => {
      active = false;
    };
  }, [block, year]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white font-extrabold px-3 py-1 rounded-xl text-xs uppercase tracking-wider">
              Block {block}
            </span>
            <span className="bg-emerald-900/40 text-emerald-100 font-semibold px-3 py-1 rounded-xl text-xs uppercase tracking-wider">
              Phase {BLOCK_PHASE_MAP[block] || "?"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">Block Details</h1>
          <p className="text-emerald-100 text-sm max-w-xl font-medium mt-1">
            Displaying collection records and registry allocations for {plots.length} properties in Block {block}.
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
            {[2021, 2022, 2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y} className="text-gray-900 font-semibold">
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                  <path d="M9 21V12h6v9" />
                </svg>
              }
              label="Total Plots"
              value={(stats?.totalPlots || plots.length).toString()}
              delta="Block properties"
              color="blue"
            />
            <StatCard
              icon={
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v2m0 6v2" />
                </svg>
              }
              label="Collected"
              value={formatPKR(stats?.totalCollected || 0)}
              delta="Received dues"
              color="green"
            />
            <StatCard
              icon={
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <path d="M9 14l-4-4 4-4M5 10h11a4 4 0 010 8h-1" />
                </svg>
              }
              label="Remaining"
              value={formatPKR(stats?.remaining || 0)}
              delta="Unpaid outstanding"
              color="red"
            />
            <StatCard
              icon={
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <path d="M21 21H3M3 21V3m4 10v8m4-12v12m4-6v6m4-14v14" strokeLinecap="round" />
                </svg>
              }
              label="Collection Rate"
              value={`${stats?.collectionRate || 0}%`}
              delta="Progress"
              color="amber"
            />
          </div>

          {/* Table-based card list */}
          <div className="card p-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-50 pb-2.5">
              Property Registers
            </h3>

            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto pr-1">
              {plots.map((plot) => {
                const pct = plot.due > 0 ? Math.round((plot.paid / plot.due) * 100) : 0;
                return (
                  <Link key={plot._id} href={`/plots/${plot._id}`} className="block">
                    <div className="flex items-center justify-between gap-4 py-3 px-2 rounded-2xl hover:bg-gray-50/70 transition-all duration-150">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-100 shrink-0">
                          {plot.plotBlock}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{plot.ownerName}</p>
                          <p className="text-xs text-gray-400 font-semibold mt-0.5">
                            Block {plot.block} — Plot {plot.plotNumber}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0">
                        <span
                          className={`badge text-[9px] font-bold py-1 px-2.5 ${
                            plot.allotmentStatus === "Active"
                              ? "badge-green"
                              : "badge-red"
                          }`}
                        >
                          {plot.allotmentStatus}
                        </span>

                        <div className="w-24 hidden sm:block">
                          <div className="flex justify-between text-[9px] font-bold text-gray-400 mb-1">
                            <span>Paid</span>
                            <span>{pct}%</span>
                          </div>
                          <ProgressBar value={pct} height={4} showLabel={false} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {plots.length === 0 && (
                <div className="text-center py-12 text-gray-400 font-medium">
                  No properties found in Block {block} for the reporting period.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
