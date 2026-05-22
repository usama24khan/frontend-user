"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import api from "../../utils/api";
import Spinner from "../../components/ui/Spinner";
import {
  ALL_BLOCKS,
  ALL_PHASES,
  BLOCK_PHASE_MAP,
  PHASE_BLOCK_MAP,
  YEARS_WITH_DATA,
  formatPKR,
  getMcRateForYear,
} from "../../constants/phases";

interface PlotData {
  _id: string;
  srNo: number;
  ownerName: string;
  plotNumber: string;
  block: string;
  phase: string;
  plotBlock: string;
  plotCode?: string;
  allotmentStatus: string;
}

export default function PlotsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<string>(String(currentYear));
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [plots, setPlots] = useState<PlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 50;

  const fetchPlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/plots?page=${page}&limit=${limit}&sortBy=block&sortOrder=asc`;
      if (selectedBlock) {
        url += `&block=${selectedBlock}`;
      } else if (selectedPhase) {
        url += `&phase=${encodeURIComponent(selectedPhase)}`;
      }
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      const res: any = await api.get(url);
      if (res.success) {
        setPlots(res.data);
        setTotal(res.meta?.total || 0);
        setTotalPages(res.meta?.totalPages || 1);
      }
    } catch (err: any) {
      setError("Failed to load plots.");
    } finally {
      setLoading(false);
    }
  }, [page, selectedBlock, selectedPhase, search]);

  useEffect(() => {
    fetchPlots();
  }, [fetchPlots]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedBlock, selectedPhase, search]);

  const handlePhaseChange = (ph: string | null) => {
    setSelectedBlock(null);
    setSelectedPhase(ph);
  };

  const handleBlockChange = (b: string | null) => {
    setSelectedPhase(null);
    setSelectedBlock(b);
  };

  // Group plots by block for display
  const groupedPlots = useMemo(() => {
    const groups: Record<string, PlotData[]> = {};
    for (const p of plots) {
      const key = p.block;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [plots]);

  const activeLabel = selectedBlock
    ? `Block ${selectedBlock}`
    : selectedPhase
      ? selectedPhase
      : "All Society";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Plot Registry
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            Browse and search all registered plots across blocks and phases.{" "}
            <span className="text-emerald-700 font-bold">{total}</span> plots
            found.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or plot..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 w-64 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col gap-3">
          {/* Phases */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-14">
              Phases
            </span>
            <button
              onClick={() => handlePhaseChange(null)}
              className={`btn text-xs py-1 px-3 ${
                !selectedPhase && !selectedBlock ? "btn-primary" : "btn-outline"
              }`}
            >
              All
            </button>
            {ALL_PHASES.map((ph) => (
              <button
                key={ph}
                onClick={() => handlePhaseChange(ph)}
                className={`btn text-xs py-1 px-3 ${
                  selectedPhase === ph ? "btn-primary" : "btn-outline"
                }`}
              >
                {ph}
              </button>
            ))}
          </div>

          <div className="h-[1px] bg-gray-100" />

          {/* Blocks */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-14">
              Blocks
            </span>
            {ALL_BLOCKS.map((b) => (
              <button
                key={b}
                onClick={() => handleBlockChange(b)}
                className={`px-2.5 py-0.5 border rounded text-[11px] font-semibold transition-all ${
                  selectedBlock === b
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center text-sm text-red-700">
          {error}
        </div>
      ) : plots.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-400 text-sm font-medium">
            No plots found for "{activeLabel}".
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedPlots.map(([block, blockPlots]) => (
            <div key={block} className="card overflow-hidden">
              {/* Block header */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center text-sm font-bold">
                    {block}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Block {block}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {BLOCK_PHASE_MAP[block]} · {blockPlots.length} plots
                    </p>
                  </div>
                </div>
                <Link
                  href={`/blocks/${block}`}
                  className="text-xs text-emerald-700 font-semibold hover:underline"
                >
                  View Block →
                </Link>
              </div>

              {/* Plot table */}
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] text-gray-400 uppercase tracking-wider">
                    <th className="text-left py-2.5 px-5 font-semibold">
                      Plot #
                    </th>
                    <th className="text-left py-2.5 px-5 font-semibold">
                      Owner Name
                    </th>
                    <th className="text-center py-2.5 px-5 font-semibold">
                      Status
                    </th>
                    <th className="text-right py-2.5 px-5 font-semibold">
                      Phase
                    </th>
                    <th className="text-right py-2.5 px-5 font-semibold" />
                  </tr>
                </thead>
                <tbody>
                  {blockPlots.map((p) => (
                    <tr
                      key={p._id}
                      className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="py-2.5 px-5 text-sm font-bold text-gray-900">
                        {p.plotCode || p.plotBlock}
                      </td>
                      <td className="py-2.5 px-5 text-sm text-gray-700 truncate max-w-[200px]">
                        {p.ownerName}
                      </td>
                      <td className="py-2.5 px-5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.allotmentStatus === "Active"
                              ? "bg-emerald-50 text-emerald-700"
                              : p.allotmentStatus === "Cancelled"
                                ? "bg-red-50 text-red-600"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {p.allotmentStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-5 text-xs text-gray-400 text-right font-medium">
                        {p.phase}
                      </td>
                      <td className="py-2.5 px-5 text-right">
                        <Link
                          href={`/plots/${p._id}`}
                          className="text-[11px] text-emerald-600 font-semibold hover:underline"
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn btn-outline text-xs px-3 py-1.5 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-xs text-gray-500 font-medium px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn btn-outline text-xs px-3 py-1.5 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
