"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Card from "../../../components/ui/Card";
import SectionLabel from "../../../components/ui/SectionLabel";
import PageHeader from "../../../components/ui/PageHeader";
import ProgressBar from "../../../components/ui/ProgressBar";
import YearSelector from "../../../components/filters/YearSelector";
import Spinner from "../../../components/ui/Spinner";

const fmt = (n: number) =>
  n >= 1_000_000 ? `₨ ${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `₨ ${(n / 1_000).toFixed(0)}K` : `₨ ${n}`;

const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const MOCK_PLOT = {
  plotBlock: "A-14", ownerName: "Muhammad Salman", block: "A", phase: 1, allotmentStatus: "Active",
  payments: [
    { year: 2024, mcRate: 400, payments: { jan: 400, feb: 400, mar: 400, apr: 0, may: 400, jun: 400, jul: 0, aug: 400, sep: 400, oct: 400, nov: 0, dec: 400 }, totalReceived: 3600, totalDue: 4800, remaining: 1200 },
    { year: 2023, mcRate: 400, payments: { jan: 400, feb: 400, mar: 400, apr: 400, may: 400, jun: 400, jul: 400, aug: 400, sep: 400, oct: 400, nov: 400, dec: 400 }, totalReceived: 4800, totalDue: 4800, remaining: 0 },
    { year: 2022, mcRate: 200, payments: { jan: 200, feb: 200, mar: 200, apr: 200, may: 0, jun: 200, jul: 200, aug: 200, sep: 0, oct: 200, nov: 200, dec: 200 }, totalReceived: 2000, totalDue: 2400, remaining: 400 },
  ],
};

export default function PlotDetailPage() {
  const { plotId } = useParams();
  const [plot, setPlot] = useState<any>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [allYears, setAllYears] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => { setPlot(MOCK_PLOT); setLoading(false); }, 400);
  }, [plotId]);

  if (loading) return <Spinner />;
  if (!plot) return <p style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Plot not found</p>;

  const payments = plot.payments || [];
  const sel = payments.find((p: any) => p.year === year);
  const totPaid = payments.reduce((s: number, p: any) => s + (p.totalReceived || 0), 0);
  const totDue = payments.reduce((s: number, p: any) => s + (p.totalDue || 0), 0);

  return (
    <div style={{ padding: "28px 28px 48px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header card */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, background: "#eaf3de",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 500, color: "#3b6d11",
            }}>
              {plot.plotBlock}
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 500, color: "#111827" }}>{plot.ownerName}</p>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                {[`Block ${plot.block}`, `Phase ${plot.phase}`, plot.allotmentStatus].map((t, i) => (
                  <span key={i} style={{
                    fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 999,
                    background: i < 2 ? "#eaf3de" : plot.allotmentStatus === "Active" ? "#eaf3de" : "#fcebeb",
                    color: i < 2 ? "#3b6d11" : plot.allotmentStatus === "Active" ? "#3b6d11" : "#a32d2d",
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>All Years</p>
            <p style={{ fontSize: 22, fontWeight: 500, color: "#3b6d11" }}>{fmt(totPaid)}</p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <YearSelector value={year} onChange={setYear} />
        <button
          onClick={() => setAllYears(!allYears)}
          style={{
            padding: "7px 16px", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8,
            background: allYears ? "#eaf3de" : "#fff", cursor: "pointer", fontSize: 12,
            fontWeight: 500, color: allYears ? "#3b6d11" : "#6b7280",
          }}
        >
          {allYears ? "✓ " : ""}All Years
        </button>
      </div>

      {/* Month grid for selected year */}
      {sel && !allYears && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <SectionLabel>{year} — MC: ₨ {sel.mcRate}/mo</SectionLabel>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))", gap: 8, marginBottom: 20 }}>
            {MONTHS.map((month, i) => {
              const val = sel.payments?.[month] || 0;
              const isPaid = val > 0;
              const isFull = val >= sel.mcRate;
              return (
                <div key={month} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  padding: "8px 4px", borderRadius: 10, minWidth: 60,
                  background: isFull ? "#eaf3de" : isPaid ? "#faeeda" : "#fcebeb",
                  color: isFull ? "#3b6d11" : isPaid ? "#854f0b" : "#a32d2d",
                  border: `0.5px solid ${isFull ? "rgba(59,109,17,0.15)" : isPaid ? "rgba(133,79,11,0.15)" : "rgba(163,45,45,0.15)"}`,
                }}>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{MONTH_SHORT[i]}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{isPaid ? val : "—"}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "Total Due", value: fmt(sel.totalDue), color: "#111827" },
              { label: "Paid", value: fmt(sel.totalReceived), color: "#3b6d11" },
              { label: "Remaining", value: fmt(sel.remaining), color: "#a32d2d" },
            ].map((m) => (
              <div key={m.label} style={{ background: "#fafafa", borderRadius: 10, padding: 14, textAlign: "center" }}>
                <p style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>{m.label}</p>
                <p style={{ fontSize: 17, fontWeight: 500, color: m.color, marginTop: 4 }}>{m.value}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <ProgressBar value={sel.totalReceived} max={sel.totalDue} height={6} />
          </div>
        </Card>
      )}

      {!sel && !allYears && (
        <Card style={{ textAlign: "center", padding: 50 }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
          <p style={{ color: "#9ca3af", fontSize: 13 }}>No payment record for {year}</p>
        </Card>
      )}

      {/* All years table */}
      {allYears && (
        <Card>
          <SectionLabel>All years summary</SectionLabel>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Year", "MC", "Due", "Paid", "Remaining", "%"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, color: "#9ca3af", borderBottom: "0.5px solid rgba(0,0,0,0.06)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any) => {
                const pct = p.totalDue > 0 ? Math.round((p.totalReceived / p.totalDue) * 100) : 0;
                return (
                  <tr key={p.year} onClick={() => { setYear(p.year); setAllYears(false); }} style={{ cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 500, borderBottom: "0.5px solid rgba(0,0,0,0.04)" }}>{p.year}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13, borderBottom: "0.5px solid rgba(0,0,0,0.04)", color: "#6b7280" }}>₨ {p.mcRate}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13, borderBottom: "0.5px solid rgba(0,0,0,0.04)" }}>{fmt(p.totalDue)}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 500, color: "#3b6d11", borderBottom: "0.5px solid rgba(0,0,0,0.04)" }}>{fmt(p.totalReceived)}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 500, color: "#a32d2d", borderBottom: "0.5px solid rgba(0,0,0,0.04)" }}>{fmt(p.remaining)}</td>
                    <td style={{ padding: "10px 14px", borderBottom: "0.5px solid rgba(0,0,0,0.04)" }}>
                      <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 999, background: pct >= 70 ? "#eaf3de" : pct >= 40 ? "#faeeda" : "#fcebeb", color: pct >= 70 ? "#3b6d11" : pct >= 40 ? "#854f0b" : "#a32d2d" }}>{pct}%</span>
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
