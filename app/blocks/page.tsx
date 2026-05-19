"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "../../components/ui/Card";
import SectionLabel from "../../components/ui/SectionLabel";
import PageHeader from "../../components/ui/PageHeader";
import ProgressBar from "../../components/ui/ProgressBar";
import YearSelector from "../../components/filters/YearSelector";
import Spinner from "../../components/ui/Spinner";
import { BLOCK_PHASE_MAP } from "../../constants/phases";

const fmt = (n: number) =>
  n >= 1_000_000 ? `₨ ${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `₨ ${(n / 1_000).toFixed(0)}K` : `₨ ${n}`;

const MOCK_BLOCKS = [
  { block: "A", totalPlots: 120, totalCollected: 8200000, remaining: 2100000, collectionRate: 80 },
  { block: "B", totalPlots: 130, totalCollected: 10400000, remaining: 1800000, collectionRate: 85 },
  { block: "C", totalPlots: 95, totalCollected: 7600000, remaining: 3200000, collectionRate: 70 },
  { block: "D", totalPlots: 110, totalCollected: 9100000, remaining: 2400000, collectionRate: 79 },
  { block: "E", totalPlots: 140, totalCollected: 12900000, remaining: 2300000, collectionRate: 85 },
  { block: "F", totalPlots: 88, totalCollected: 6800000, remaining: 2800000, collectionRate: 71 },
  { block: "G", totalPlots: 75, totalCollected: 5400000, remaining: 1900000, collectionRate: 74 },
  { block: "H", totalPlots: 100, totalCollected: 7200000, remaining: 2600000, collectionRate: 73 },
  { block: "I", totalPlots: 92, totalCollected: 6900000, remaining: 2100000, collectionRate: 77 },
  { block: "J", totalPlots: 85, totalCollected: 6100000, remaining: 2300000, collectionRate: 73 },
  { block: "K", totalPlots: 60, totalCollected: 4300000, remaining: 1700000, collectionRate: 72 },
  { block: "L", totalPlots: 145, totalCollected: 11200000, remaining: 3100000, collectionRate: 78 },
];

export default function BlocksPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Replace with: fetch(`${API_URL}/blocks?year=${year}`)
    setTimeout(() => {
      setBlocks(MOCK_BLOCKS);
      setLoading(false);
    }, 400);
  }, [year]);

  if (loading) return <Spinner />;

  return (
    <div style={{ padding: "28px 28px 48px", maxWidth: 1100, margin: "0 auto" }}>
      <PageHeader title="Blocks" subtitle="Overview of all blocks across phases" right={<YearSelector value={year} onChange={setYear} />} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {blocks.map((b) => (
          <Link key={b.block} href={`/blocks/${b.block}`} style={{ textDecoration: "none" }}>
            <Card style={{ cursor: "pointer", transition: "box-shadow 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10, background: "#eaf3de",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 500, color: "#3b6d11", flexShrink: 0,
                }}>
                  {b.block}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "#111827" }}>Block {b.block}</p>
                  <span style={{
                    fontSize: 10, fontWeight: 500, color: "#3b6d11", background: "#eaf3de",
                    padding: "2px 8px", borderRadius: 999,
                  }}>
                    Phase {BLOCK_PHASE_MAP[b.block] || "?"}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>Collected</p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "#3b6d11", marginTop: 2 }}>{fmt(b.totalCollected)}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>Remaining</p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "#a32d2d", marginTop: 2 }}>{fmt(b.remaining)}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>Plots</p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "#111827", marginTop: 2 }}>{b.totalPlots}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>Rate</p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "#3b6d11", marginTop: 2 }}>{b.collectionRate}%</p>
                </div>
              </div>

              <ProgressBar value={b.collectionRate} height={5} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
