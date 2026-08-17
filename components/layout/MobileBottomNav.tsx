"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ── Route definitions ─────────────────────────────────────────────────────────
// Mirrors the Sidebar, trimmed to the five destinations that matter on mobile.
const NAV_ITEMS = [
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
    href: "/plots",
    label: "Records",
    exact: false,
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4.5-4.5" strokeLinecap="round" />
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
    href: "/complaints",
    label: "Complaint",
    exact: false,
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
  },
  // Accounts replaces Blocks on the bar — residents ask where the money went far
  // more often than they browse the block list, which stays in the sidebar.
  {
    href: "/finance",
    label: "Accounts",
    exact: false,
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 20h18" strokeLinecap="round" />
        <rect x="5" y="11" width="3.5" height="6" rx="1" />
        <rect x="10.5" y="7" width="3.5" height="10" rx="1" />
        <rect x="16" y="13" width="3.5" height="4" rx="1" />
      </svg>
    ),
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function MobileBottomNav() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean, currentPath: string) {
    if (exact) return currentPath === href;
    // For /plots/[id] match both /plots and /plots/...
    return currentPath === href || currentPath.startsWith(href + "/");
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
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
