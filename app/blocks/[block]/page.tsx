"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Card from "../../../components/ui/Card";
import SectionLabel from "../../../components/ui/SectionLabel";
import PageHeader from "../../../components/ui/PageHeader";
import StatCard from "../../../components/ui/StatCard";
import ProgressBar from "../../../components/ui/ProgressBar";
import YearSelector from "../../../components/filters/YearSelector";
import Spinner from "../../../components/ui/Spinner";
import { BLOCK_PHASE_MAP } from "../../../constants/phases";

const fmt = (n: number) =>
  n >= 1_000_000 ? `₨ ${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `₨ ${(n / 1_000).toFixed(0)}K` : `₨ ${n}`;

const MOCK_PLOTS = [
  { _id: "1", plotBlock: "A-14", ownerName: "Muhammad Salman", allotmentStatus: "Active", paid: 4200, due: 4800 },
  { _id: "2", plotBlock: "A-22", ownerName: "Ayesha Malik", allotmentStatus: "Active", paid: 3900, due: 4800 },
  { _id: "3", plotBlock: "A-07", ownerName: "Tariq Hussain", allotmentStatus: "Cancelled", paid: 1200, due: 4800 },
  { _id: "4", plotBlock: "A-31", ownerName: "Sana Fatima", allotmentStatus: "Active", paid: 4800, due: 4800 },
  { _id: "5", plotBlock: "A-45", ownerName: "Umar Farooq", allotmentStatus: "Active", paid: 2800, due: 4800 },
  { _id: "6", plotBlock: "A-12", ownerName: "Ahmed Khan", allotmentStatus: "Active", paid: 3200, due: 4800 },
];

export default function BlockDetailPage() {
  const params = useParams();
  const block = (params.block as string)?.toUpperCase();
  const [year, setYear] = useState(new Date().getFullYear());
  const [plots, setPlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPlots(MOCK_PLOTS);
      setLoading(false);
    }, 400);
  }, [block, year]);

  if (loading) return <Spinner />;

  return (
    <div style={{ padding: "28px 28px 48px", maxWidth: 1100, margin: "0 auto" }}>
      <PageHeader
        title={`Block ${block}`}
        subtitle={`Phase ${BLOCK_PHASE_MAP[block] || "?"} — ${plots.length} plots`}
        right={<YearSelector value={year} onChange={setYear} />}
      />

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>}
          label="Total Plots" value={plots.length.toString()} color="blue"
        />
        <StatCard
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v2m0 6v2"/></svg>}
          label="Collected" value={fmt(28200000)} delta="+8%" color="green"
        />
        <StatCard
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M9 14l-4-4 4-4M5 10h11a4 4 0 010 8h-1"/></svg>}
          label="Remaining" value={fmt(5800000)} color="red"
        />
        <StatCard
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M21 21H3M3 21V3m4 10v8m4-12v12m4-6v6m4-14v14" strokeLinecap="round"/></svg>}
          label="Rate" value="83%" color="amber"
        />
      </div>

      {/* Plot list */}
      <Card>
        <SectionLabel>Plots in Block {block}</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {plots.map((plot, idx) => {
            const pct = plot.due > 0 ? Math.round((plot.paid / plot.due) * 100) : 0;
            return (
              <Link key={plot._id} href={`/plots/${plot._id}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 8px",
                    borderBottom: idx < plots.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none",
                    cursor: "pointer", transition: "background 0.15s", borderRadius: 8,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: "#eaf3de",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 500, color: "#3b6d11", flexShrink: 0,
                  }}>
                    {plot.plotBlock}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{plot.ownerName}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                      Plot {plot.plotBlock}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 999,
                    background: plot.allotmentStatus === "Active" ? "#eaf3de" : "#fcebeb",
                    color: plot.allotmentStatus === "Active" ? "#3b6d11" : "#a32d2d",
                  }}>
                    {plot.allotmentStatus}
                  </span>
                  <div style={{ width: 100 }}>
                    <ProgressBar value={pct} height={4} showLabel={true} />
                  </div>
                </div>
              </Link>
            );
          })}
          {plots.length === 0 && (
            <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: 40 }}>
              No plots found in Block {block}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
