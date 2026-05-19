"use client";
import { useState, useEffect } from "react";
import StatCard from "../components/ui/StatCard";
import ProgressBar from "../components/ui/ProgressBar";
import YearSelector from "../components/filters/YearSelector";
import Spinner from "../components/ui/Spinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Link from "next/link";

// ─── mock data (replace with real API calls) ────────────────────────────────
const MOCK_OVERVIEW = {
  totalPlots: 1240,
  totalCollected: 48200000,
  totalRemaining: 11800000,
  collectionRate: 80.3,
};
const MOCK_BLOCKS = [
  {
    block: "A",
    totalCollected: 8200000,
    remaining: 2100000,
    collectionRate: 80,
  },
  {
    block: "B",
    totalCollected: 10400000,
    remaining: 1800000,
    collectionRate: 85,
  },
  {
    block: "C",
    totalCollected: 7600000,
    remaining: 3200000,
    collectionRate: 70,
  },
  {
    block: "D",
    totalCollected: 9100000,
    remaining: 2400000,
    collectionRate: 79,
  },
  {
    block: "E",
    totalCollected: 12900000,
    remaining: 2300000,
    collectionRate: 85,
  },
];
const MOCK_MONTHLY = [
  { month: "jan", total: 2100000, paidCount: 42 },
  { month: "feb", total: 3400000, paidCount: 68 },
  { month: "mar", total: 4200000, paidCount: 84 },
  { month: "apr", total: 3800000, paidCount: 76 },
  { month: "may", total: 4900000, paidCount: 98 },
  { month: "jun", total: 5100000, paidCount: 102 },
  { month: "jul", total: 4300000, paidCount: 86 },
  { month: "aug", total: 3900000, paidCount: 78 },
  { month: "sep", total: 5600000, paidCount: 112 },
  { month: "oct", total: 4700000, paidCount: 94 },
  { month: "nov", total: 5200000, paidCount: 104 },
  { month: "dec", total: 3000000, paidCount: 60 },
];
const MOCK_TOP_PLOTS = [
  {
    plot: { ownerName: "Muhammad Salman", plotBlock: "A-14" },
    totalReceived: 4200000,
  },
  {
    plot: { ownerName: "Ayesha Malik", plotBlock: "B-07" },
    totalReceived: 3900000,
  },
  {
    plot: { ownerName: "Tariq Hussain", plotBlock: "E-22" },
    totalReceived: 3500000,
  },
  {
    plot: { ownerName: "Sana Fatima", plotBlock: "C-11" },
    totalReceived: 3100000,
  },
  {
    plot: { ownerName: "Umar Farooq", plotBlock: "D-03" },
    totalReceived: 2800000,
  },
];
const MOCK_PHASES = [
  { phase: 1, totalCollected: 18500000 },
  { phase: 2, totalCollected: 15300000 },
  { phase: 3, totalCollected: 14400000 },
];

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 1_000_000
    ? `₨ ${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `₨ ${(n / 1_000).toFixed(0)}K`
      : `₨ ${n}`;

const fmtNum = (n: number) => n.toLocaleString();

// ─── chart colours ───────────────────────────────────────────────────────────
const PHASE_COLORS = ["#3b6d11", "#185fa5", "#854f0b"];
const GRID_COLOR = "rgba(0,0,0,0.05)";
const TEXT_COLOR = "#9ca3af";

// ─── sub-components ──────────────────────────────────────────────────────────
function Card({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid rgba(0,0,0,0.08)",
        borderRadius: 16,
        padding: "22px 24px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 500,
        color: "#9ca3af",
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        marginBottom: 16,
      }}
    >
      {children}
    </p>
  );
}

// ─── rank badge colours ───────────────────────────────────────────────────────
const RANK_STYLES: Record<number, { bg: string; color: string }> = {
  0: { bg: "#faeeda", color: "#854f0b" }, // gold
  1: { bg: "#d3d1c7", color: "#2c2c2a" }, // silver
  2: { bg: "#faeeda", color: "#ba7517" }, // bronze
};

// ─── main page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [overview, setOverview] = useState<any>(null);
  const [blockStats, setBlockStats] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [topPlots, setTopPlots] = useState<any[]>([]);
  const [phaseStats, setPhaseStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace this block with real API calls when ready
    setLoading(true);
    setTimeout(() => {
      setOverview(MOCK_OVERVIEW);
      setBlockStats(MOCK_BLOCKS);
      setMonthlyTrend(MOCK_MONTHLY);
      setTopPlots(MOCK_TOP_PLOTS);
      setPhaseStats(MOCK_PHASES);
      setLoading(false);
    }, 600);
  }, [year]);

  if (loading) return <Spinner />;

  // ── chart data transforms ──────────────────────────────────────────────────
  const blockChartData = blockStats.map((b) => ({
    name: `Block ${b.block}`,
    collected: b.totalCollected / 1_000_000,
    remaining: b.remaining / 1_000_000,
    rate: b.collectionRate,
  }));

  const monthChartData = monthlyTrend.map((m) => ({
    name: m.month.slice(0, 3).toUpperCase(),
    amount: m.total / 1_000_000,
    count: m.paidCount,
  }));

  const phaseChartData = phaseStats.map((p) => ({
    name: `Phase ${p.phase}`,
    value: p.totalCollected / 1_000_000,
  }));

  // ── tooltip formatters ────────────────────────────────────────────────────
  const barTip = (v: any) => `₨ ${Number(v).toFixed(1)}M`;

  return (
    <div
      style={{ padding: "28px 28px 48px", maxWidth: 1100, margin: "0 auto" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: "#111827",
              letterSpacing: "-0.3px",
            }}
          >
            Overview
          </h1>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 3 }}>
            Property collection analytics &amp; performance
          </p>
        </div>
        <YearSelector value={year} onChange={setYear} />
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon={
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
            >
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
              <path d="M9 21V12h6v9" />
            </svg>
          }
          label="Total Plots"
          value={fmtNum(overview?.totalPlots || 0)}
          delta="Active"
          color="blue"
        />
        <StatCard
          icon={
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v2m0 6v2M9.5 9.5C9.5 8.67 10.67 8 12 8s2.5.67 2.5 1.5S13.33 11 12 11s-2.5.67-2.5 1.5S10.67 16 12 16s2.5-.67 2.5-1.5" />
            </svg>
          }
          label="Total Collected"
          value={fmt(overview?.totalCollected || 0)}
          delta="+12% vs last year"
          color="green"
        />
        <StatCard
          icon={
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
            >
              <path d="M9 14l-4-4 4-4M5 10h11a4 4 0 010 8h-1" />
            </svg>
          }
          label="Remaining"
          value={fmt(overview?.totalRemaining || 0)}
          delta="Overdue"
          color="red"
        />
        <StatCard
          icon={
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21H3M3 21V3m4 10v8m4-12v12m4-6v6m4-14v14"
                strokeLinecap="round"
              />
            </svg>
          }
          label="Collection Rate"
          value={`${overview?.collectionRate || 0}%`}
          delta="On track"
          color="amber"
        />
      </div>

      {/* ── Charts Row ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Block-wise bar */}
        <Card>
          <SectionLabel>Block-wise collection</SectionLabel>
          {/* manual legend */}
          <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
            {[
              { label: "Collected", color: "#3b6d11" },
              { label: "Remaining", color: "#e5e7eb" },
            ].map((l) => (
              <span
                key={l.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  color: "#6b7280",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: l.color,
                    display: "inline-block",
                  }}
                />
                {l.label}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={blockChartData} barCategoryGap="30%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={GRID_COLOR}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: TEXT_COLOR }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: TEXT_COLOR }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}M`}
              />
              <Tooltip
                formatter={barTip}
                contentStyle={{
                  borderRadius: 8,
                  border: "0.5px solid rgba(0,0,0,0.08)",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="collected"
                fill="#3b6d11"
                radius={[5, 5, 0, 0]}
                name="Collected"
              />
              <Bar
                dataKey="remaining"
                fill="#e5e7eb"
                radius={[5, 5, 0, 0]}
                name="Remaining"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Phase donut */}
        <Card>
          <SectionLabel>Phase-wise breakdown</SectionLabel>
          <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
            {phaseChartData.map((p, i) => (
              <span
                key={p.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  color: "#6b7280",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: PHASE_COLORS[i],
                    display: "inline-block",
                  }}
                />
                {p.name} — ₨{p.value.toFixed(1)}M
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={phaseChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={90}
                paddingAngle={3}
              >
                {phaseChartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={PHASE_COLORS[i % PHASE_COLORS.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: any) => `₨ ${Number(v).toFixed(1)}M`}
                contentStyle={{
                  borderRadius: 8,
                  border: "0.5px solid rgba(0,0,0,0.08)",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Monthly Trend ────────────────────────────────────────────────── */}
      <Card style={{ marginBottom: 16 }}>
        <SectionLabel>Monthly collection trend — {year}</SectionLabel>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthChartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={GRID_COLOR}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: TEXT_COLOR }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: TEXT_COLOR }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}M`}
            />
            <Tooltip
              formatter={(v: any) => `₨ ${Number(v).toFixed(1)}M`}
              contentStyle={{
                borderRadius: 8,
                border: "0.5px solid rgba(0,0,0,0.08)",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3b6d11"
              strokeWidth={2.5}
              dot={{ fill: "#3b6d11", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#3b6d11", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Bottom Row ────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Top paid plots */}
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <SectionLabel>Top paid plots</SectionLabel>
            <Link
              href="/leaderboard"
              style={{
                fontSize: 12,
                color: "#3b6d11",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              View all →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {(topPlots || []).slice(0, 5).map((item: any, idx: number) => {
              const rs = RANK_STYLES[idx] ?? {
                bg: "#f9fafb",
                color: "#6b7280",
              };
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 0",
                    borderBottom:
                      idx < 4 ? "0.5px solid rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: rs.bg,
                      color: rs.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#111827",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.plot?.ownerName || "N/A"}
                    </p>
                    <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                      Plot {item.plot?.plotBlock || "—"}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#3b6d11",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmt(item.totalReceived || 0)}
                  </span>
                </div>
              );
            })}
            {(!topPlots || topPlots.length === 0) && (
              <p
                style={{
                  fontSize: 13,
                  color: "#9ca3af",
                  textAlign: "center",
                  padding: 20,
                }}
              >
                No data for this year
              </p>
            )}
          </div>
        </Card>

        {/* Block summary */}
        <Card>
          <SectionLabel>Block summary</SectionLabel>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              maxHeight: 340,
              overflowY: "auto",
            }}
          >
            {blockStats.map((b: any) => (
              <Link
                key={b.block}
                href={`/blocks/${b.block}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 8px",
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "#eaf3de",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#3b6d11",
                      flexShrink: 0,
                    }}
                  >
                    {b.block}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 5,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#111827",
                        }}
                      >
                        Block {b.block}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "#3b6d11",
                        }}
                      >
                        {b.collectionRate}%
                      </span>
                    </div>
                    <ProgressBar
                      value={b.collectionRate}
                      height={5}
                      showLabel={false}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
