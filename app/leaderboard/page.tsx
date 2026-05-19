"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "../../components/ui/Card";
import SectionLabel from "../../components/ui/SectionLabel";
import PageHeader from "../../components/ui/PageHeader";
import ProgressBar from "../../components/ui/ProgressBar";
import YearSelector from "../../components/filters/YearSelector";
import Spinner from "../../components/ui/Spinner";

const fmt = (n: number) =>
  n >= 1_000_000 ? `₨ ${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `₨ ${(n / 1_000).toFixed(0)}K` : `₨ ${n}`;

const RANK_STYLES: Record<number, { bg: string; color: string }> = {
  0: { bg: "#faeeda", color: "#854f0b" },
  1: { bg: "#d3d1c7", color: "#2c2c2a" },
  2: { bg: "#faeeda", color: "#ba7517" },
};

const MOCK_TOP_PLOTS = [
  { plot: { _id: "1", ownerName: "Muhammad Salman", plotBlock: "A-14" }, totalReceived: 4200000, totalDue: 4800000, percentage: 88 },
  { plot: { _id: "2", ownerName: "Ayesha Malik", plotBlock: "B-07" }, totalReceived: 3900000, totalDue: 4800000, percentage: 81 },
  { plot: { _id: "3", ownerName: "Tariq Hussain", plotBlock: "E-22" }, totalReceived: 3500000, totalDue: 4800000, percentage: 73 },
  { plot: { _id: "4", ownerName: "Sana Fatima", plotBlock: "C-11" }, totalReceived: 3100000, totalDue: 4800000, percentage: 65 },
  { plot: { _id: "5", ownerName: "Umar Farooq", plotBlock: "D-03" }, totalReceived: 2800000, totalDue: 4800000, percentage: 58 },
  { plot: { _id: "6", ownerName: "Hina Rasheed", plotBlock: "A-31" }, totalReceived: 2600000, totalDue: 4800000, percentage: 54 },
  { plot: { _id: "7", ownerName: "Bilal Ahmed", plotBlock: "F-19" }, totalReceived: 2400000, totalDue: 4800000, percentage: 50 },
];

const MOCK_TOP_BLOCKS = [
  { block: "E", phase: 2, collectionRate: 85, totalCollected: 12900000 },
  { block: "B", phase: 1, collectionRate: 85, totalCollected: 10400000 },
  { block: "A", phase: 1, collectionRate: 80, totalCollected: 8200000 },
  { block: "D", phase: 2, collectionRate: 79, totalCollected: 9100000 },
  { block: "L", phase: 3, collectionRate: 78, totalCollected: 11200000 },
];

const MOCK_DEFAULTERS = [
  { plot: { _id: "10", ownerName: "Kashif Mehmood", plotBlock: "G-42", allotmentStatus: "Active" }, totalDue: 4800 },
  { plot: { _id: "11", ownerName: "Zubair Shah", plotBlock: "H-15", allotmentStatus: "Active" }, totalDue: 4800 },
  { plot: { _id: "12", ownerName: "Nadia Parveen", plotBlock: "K-08", allotmentStatus: "Active" }, totalDue: 4800 },
  { plot: { _id: "13", ownerName: "Faisal Raza", plotBlock: "I-23", allotmentStatus: "Cancelled" }, totalDue: 4800 },
];

const TABS = [
  { key: "plots", label: "Top Plots" },
  { key: "blocks", label: "Top Blocks" },
  { key: "defaulters", label: "Defaulters" },
] as const;

export default function LeaderboardPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<"plots" | "blocks" | "defaulters">("plots");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 350);
  }, [year, activeTab]);

  return (
    <div style={{ padding: "28px 28px 48px", maxWidth: 1100, margin: "0 auto" }}>
      <PageHeader title="Leaderboard" subtitle="Rankings and defaulters list" right={<YearSelector value={year} onChange={setYear} />} />

      {/* Tabs */}
      <div style={{ display: "inline-flex", background: "#f3f4f6", padding: 3, borderRadius: 10, marginBottom: 20, gap: 2 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "7px 18px", borderRadius: 8, fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
              background: activeTab === tab.key ? "#fff" : "transparent",
              color: activeTab === tab.key ? (tab.key === "defaulters" ? "#a32d2d" : "#3b6d11") : "#6b7280",
              boxShadow: activeTab === tab.key ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <Card>
          {/* Top Plots tab */}
          {activeTab === "plots" && (
            <>
              <SectionLabel>Top paid plots — {year}</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {MOCK_TOP_PLOTS.map((item, idx) => {
                  const rs = RANK_STYLES[idx] ?? { bg: "#f9fafb", color: "#6b7280" };
                  return (
                    <Link key={idx} href={`/plots/${item.plot._id}`} style={{ textDecoration: "none" }}>
                      <div
                        style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "11px 8px",
                          borderBottom: idx < MOCK_TOP_PLOTS.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none",
                          cursor: "pointer", borderRadius: 6, transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: rs.bg, color: rs.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.plot.ownerName}</p>
                          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>Plot {item.plot.plotBlock}</p>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#3b6d11", whiteSpace: "nowrap" }}>{fmt(item.totalReceived)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* Top Blocks tab */}
          {activeTab === "blocks" && (
            <>
              <SectionLabel>Top blocks by collection rate — {year}</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {MOCK_TOP_BLOCKS.map((item, idx) => {
                  const rs = RANK_STYLES[idx] ?? { bg: "#f9fafb", color: "#6b7280" };
                  return (
                    <Link key={idx} href={`/blocks/${item.block}`} style={{ textDecoration: "none" }}>
                      <div
                        style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "11px 8px",
                          borderBottom: idx < MOCK_TOP_BLOCKS.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none",
                          cursor: "pointer", borderRadius: 6, transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: rs.bg, color: rs.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
                          {idx + 1}
                        </div>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eaf3de", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "#3b6d11", flexShrink: 0 }}>
                          {item.block}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>Block {item.block}</p>
                          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>Phase {item.phase}</p>
                        </div>
                        <div style={{ width: 110 }}>
                          <ProgressBar value={item.collectionRate} height={5} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#3b6d11", whiteSpace: "nowrap", minWidth: 60, textAlign: "right" }}>{fmt(item.totalCollected)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* Defaulters tab */}
          {activeTab === "defaulters" && (
            <>
              <SectionLabel>Plots with zero payment — {year}</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {MOCK_DEFAULTERS.map((item, idx) => (
                  <Link key={idx} href={`/plots/${item.plot._id}`} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "11px 8px",
                        borderBottom: idx < MOCK_DEFAULTERS.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none",
                        cursor: "pointer", borderRadius: 6, transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fcebeb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="14" height="14" fill="none" stroke="#a32d2d" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M4.93 19h14.14c1.34 0 2.17-1.46 1.5-2.63L13.5 4.37c-.67-1.17-2.33-1.17-3 0L3.43 16.37c-.67 1.17.16 2.63 1.5 2.63z"/></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{item.plot.ownerName}</p>
                        <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>Plot {item.plot.plotBlock}</p>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 999,
                        background: item.plot.allotmentStatus === "Active" ? "#eaf3de" : "#fcebeb",
                        color: item.plot.allotmentStatus === "Active" ? "#3b6d11" : "#a32d2d",
                      }}>
                        {item.plot.allotmentStatus}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#a32d2d", whiteSpace: "nowrap" }}>{fmt(item.totalDue)}</span>
                    </div>
                  </Link>
                ))}
                {MOCK_DEFAULTERS.length === 0 && (
                  <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: 40 }}>No defaulters found</p>
                )}
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
