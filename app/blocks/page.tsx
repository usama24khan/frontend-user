"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../utils/api";
import ProgressBar from "../../components/ui/ProgressBar";
import Spinner from "../../components/ui/Spinner";
import { BLOCK_PHASE_MAP } from "../../constants/phases";

const formatPKR = (n: number) => {
  return "₨ " + Math.round(n).toLocaleString("en-PK");
};

export default function BlocksPage() {
  const [year, setYear] = useState(2026);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchBlocks = async () => {
      setLoading(true);
      try {
        const res: any = await api.get(`/blocks?year=${year}`);
        if (active && res.success) {
          const sortedBlocks = [...res.data].sort((a: any, b: any) =>
            a.block.localeCompare(b.block)
          );
          setBlocks(sortedBlocks);
        }
      } catch (err) {
        console.error("Failed to fetch blocks:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchBlocks();
    return () => {
      active = false;
    };
  }, [year]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Block Directory</h1>
          <p className="text-emerald-100 text-sm max-w-xl font-medium">
            Search block recovery metrics, look up property counts, and view relative collected collections.
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

      {/* Grid listing */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blocks.map((b) => (
            <Link key={b.block} href={`/blocks/${b.block}`} className="block">
              <div className="card p-5 cursor-pointer flex flex-col gap-4 relative overflow-hidden">
                {/* Accent bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-600 to-green-500" />

                {/* Avatar header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black text-base border border-emerald-100">
                    {b.block}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Block {b.block}</h3>
                    <span className="badge badge-green text-[9px] font-bold mt-0.5">
                      Phase {BLOCK_PHASE_MAP[b.block] || "?"}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3.5 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                      Collected
                    </span>
                    <span className="text-xs font-extrabold text-emerald-800 mt-0.5 block">
                      {formatPKR(b.totalCollected)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                      Remaining
                    </span>
                    <span className="text-xs font-extrabold text-rose-800 mt-0.5 block">
                      {formatPKR(b.remaining)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                      Total Plots
                    </span>
                    <span className="text-xs font-extrabold text-gray-800 mt-0.5 block">
                      {b.totalPlots} Plots
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                      Rate
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 mt-0.5 block">
                      {b.collectionRate}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <ProgressBar value={b.collectionRate} height={5} showLabel={false} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
