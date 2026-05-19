"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "../../components/ui/Card";
import SectionLabel from "../../components/ui/SectionLabel";
import PageHeader from "../../components/ui/PageHeader";
import ProgressBar from "../../components/ui/ProgressBar";
import YearSelector from "../../components/filters/YearSelector";
import Spinner from "../../components/ui/Spinner";
import { PHASE_BLOCK_MAP } from "../../constants/phases";

const fmt = (n: number) =>
  n >= 1_000_000 ? `₨ ${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `₨ ${(n / 1_000).toFixed(0)}K` : `₨ ${n}`;

const PHASE_COLORS: Record<number, { bg: string; color: string; bar: string }> = {
  1: { bg: "#eaf3de", color: "#3b6d11", bar: "#3b6d11" },
  2: { bg: "#e6f1fb", color: "#185fa5", bar: "#185fa5" },
  3: { bg: "#faeeda", color: "#854f0b", bar: "#854f0b" },
};

const MOCK_PHASES = [
  { phase: 1, totalPlots: 590, totalCollected: 42800000, totalDue: 56400000, remaining: 13600000, collectionRate: 76,
    blockStats: [
      { block: "A", collectionRate: 80, totalCollected: 8200000 },
      { block: "B", collectionRate: 85, totalCollected: 10400000 },
      { block: "H", collectionRate: 73, totalCollected: 7200000 },
      { block: "I", collectionRate: 77, totalCollected: 6900000 },
      { block: "J", collectionRate: 73, totalCollected: 6100000 },
      { block: "K", collectionRate: 72, totalCollected: 4300000 },
    ]},
  { phase: 2, totalPlots: 508, totalCollected: 41800000, totalDue: 48800000, remaining: 7000000, collectionRate: 86,
    blockStats: [
      { block: "C", collectionRate: 70, totalCollected: 7600000 },
      { block: "D", collectionRate: 79, totalCollected: 9100000 },
      { block: "E", collectionRate: 85, totalCollected: 12900000 },
      { block: "F", collectionRate: 71, totalCollected: 6800000 },
      { block: "G", collectionRate: 74, totalCollected: 5400000 },
    ]},
  { phase: 3, totalPlots: 145, totalCollected: 11200000, totalDue: 13900000, remaining: 2700000, collectionRate: 81,
    blockStats: [
      { block: "L", collectionRate: 81, totalCollected: 11200000 },
    ]},
];

export default function PhasesPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [phases, setPhases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => { setPhases(MOCK_PHASES); setLoading(false); }, 400);
  }, [year]);

  if (loading) return <Spinner />;

  return (
    <div style={{ padding: "28px 28px 48px", maxWidth: 1100, margin: "0 auto" }}>
      <PageHeader title="Phases" subtitle="Phase-wise overview of all blocks" right={<YearSelector value={year} onChange={setYear} />} />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {phases.map((phase) => {
          const pc = PHASE_COLORS[phase.phase] || PHASE_COLORS[1];
          return (
            <Card key={phase.phase}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12, background: pc.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 500, color: pc.color,
                  }}>
                    P{phase.phase}
                  </div>
                  <div>
                    <p style={{ fontSize: 17, fontWeight: 500, color: "#111827" }}>Phase {phase.phase}</p>
                    <p style={{ fontSize: 12, color: "#9ca3af" }}>
                      Blocks: {(phase.blockStats || []).map((bs: any) => bs.block).join(", ")}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 22, fontWeight: 500, color: pc.color }}>{phase.collectionRate}%</p>
                  <p style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>Collection Rate</p>
                </div>
              </div>

              {/* Metric row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
                {[
                  { label: "Total Plots", value: phase.totalPlots, color: "#111827" },
                  { label: "Collected", value: fmt(phase.totalCollected), color: "#3b6d11" },
                  { label: "Total Due", value: fmt(phase.totalDue), color: "#a32d2d" },
                  { label: "Remaining", value: fmt(phase.remaining), color: "#854f0b" },
                ].map((m) => (
                  <div key={m.label} style={{ background: "#fafafa", borderRadius: 10, padding: 14 }}>
                    <p style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>{m.label}</p>
                    <p style={{ fontSize: 17, fontWeight: 500, color: m.color, marginTop: 4 }}>{m.value}</p>
                  </div>
                ))}
              </div>

              <ProgressBar value={phase.collectionRate} height={6} />

              {/* Block breakdown */}
              {phase.blockStats && phase.blockStats.length > 0 && (
                <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
                  {phase.blockStats.map((bs: any) => (
                    <Link key={bs.block} href={`/blocks/${bs.block}`} style={{ textDecoration: "none" }}>
                      <div
                        style={{
                          background: "#fafafa", borderRadius: 10, padding: 12,
                          border: "0.5px solid rgba(0,0,0,0.04)", cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#fafafa")}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>Block {bs.block}</span>
                          <span style={{ fontSize: 11, fontWeight: 500, color: pc.color }}>{bs.collectionRate}%</span>
                        </div>
                        <ProgressBar value={bs.collectionRate} height={4} showLabel={false} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
