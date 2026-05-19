"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Overview", icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  )},
  { href: "/blocks", label: "Blocks", icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
  )},
  { href: "/phases", label: "Phases", icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
  )},
  { href: "/leaderboard", label: "Leaderboard", icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M8 21V11M12 21V3M16 21v-6" strokeLinecap="round"/></svg>
  )},
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 30 }} onClick={onClose} />}
      <aside
        style={{
          width: 240,
          minHeight: "100vh",
          padding: "28px 14px",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 40,
          background: "#fff",
          borderRight: "0.5px solid rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.3s ease",
          transform: open ? "translateX(0)" : undefined,
        }}
        className={open ? "open" : ""}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 32 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "#eaf3de",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 500, color: "#3b6d11",
          }}>
            K4
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#111827", lineHeight: 1.2 }}>KKB4</p>
            <p style={{ fontSize: 10, color: "#9ca3af" }}>Maintenance</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onClose} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 8,
                    background: active ? "#eaf3de" : "transparent",
                    color: active ? "#3b6d11" : "#6b7280",
                    fontSize: 13, fontWeight: 500,
                    transition: "all 0.15s", cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f9fafb"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "14px 12px", background: "#fafafa", borderRadius: 10, marginTop: 16 }}>
          <p style={{ fontSize: 10, color: "#9ca3af" }}>KKB4 Housing Society</p>
          <p style={{ fontSize: 11, fontWeight: 500, color: "#6b7280", marginTop: 2 }}>v1.0.0</p>
        </div>
      </aside>
    </>
  );
}
