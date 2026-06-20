"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

// ── Route definitions ─────────────────────────────────────────────────────────
// Mapped from actual top-level routes in the app (Sidebar navItems + myAccountItems)
function useNavItems() {
  const resident = useSelector((s: RootState) => s.auth.resident);
  const plotHref = resident ? `/plots/${resident.id}` : "/plots";

  return [
    {
      href: "/",
      label: "Home",
      exact: true,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      href: plotHref,
      label: "My Plot",
      exact: false,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V9.5z" />
        </svg>
      ),
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      exact: false,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 21V11M12 21V3M16 21v-6" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      href: "/notices",
      label: "Notices",
      exact: false,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
          <path d="M14 2v6h6M8 13h8M8 17h5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      href: "/blocks",
      label: "Blocks",
      exact: false,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
          <path d="M9 21V12h6v9" />
        </svg>
      ),
    },
  ];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MobileBottomNav() {
  const pathname = usePathname();
  const navItems = useNavItems();

  function isActive(href: string, exact: boolean, currentPath: string) {
    if (exact) return currentPath === href;
    // For /plots/[id] match both /plots and /plots/...
    return currentPath === href || currentPath.startsWith(href + "/");
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="Main navigation">
      {navItems.map((item) => {
        const active = isActive(item.href, item.exact, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-bottom-nav-item${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="mobile-bottom-nav-icon">{item.icon}</span>
            <span className="mobile-bottom-nav-label">{item.label}</span>
            {active && <span className="mobile-bottom-nav-indicator" aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );
}
