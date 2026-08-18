"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

/**
 * Phone navigation: four destinations on the bar, everything else behind "More".
 *
 * The bar alone used to be the whole of it, which left Blocks, Phases and
 * Leaderboard with no way in at all on a phone — the sidebar only opens from the
 * navbar, and the navbar is hidden below 768px. The drawer now mirrors the
 * desktop sidebar exactly, same two groups and same order, so every page a
 * resident can reach on a laptop is reachable on a phone.
 */

// ── Icons ────────────────────────────────────────────────────────────────────
// 22px for the bar, 20px in the drawer, matching each surface's type scale.

const icons = {
  home: (s = 22) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  search: (s = 22) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.5-4.5" strokeLinecap="round" />
    </svg>
  ),
  accounts: (s = 22) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 20h18" strokeLinecap="round" />
      <rect x="5" y="11" width="3.5" height="6" rx="1" />
      <rect x="10.5" y="7" width="3.5" height="10" rx="1" />
      <rect x="16" y="13" width="3.5" height="4" rx="1" />
    </svg>
  ),
  notices: (s = 22) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" strokeLinecap="round" />
    </svg>
  ),
  complaint: (s = 22) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  ),
  blocks: (s = 22) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  ),
  phases: (s = 22) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  leaderboard: (s = 22) => (
    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 21V11M12 21V3M16 21v-6" strokeLinecap="round" />
    </svg>
  ),
} as const;

type IconKey = keyof typeof icons;

interface NavEntry {
  href: string;
  labelKey: string;
  icon: IconKey;
  /** Only "/" needs an exact match; the rest also match their child routes. */
  exact?: boolean;
}

/** The four a resident opens most often. */
const PRIMARY_NAV: NavEntry[] = [
  { href: "/", labelKey: "nav.overview", icon: "home", exact: true },
  { href: "/plots", labelKey: "nav.records", icon: "search" },
  { href: "/finance", labelKey: "nav.finance", icon: "accounts" },
  { href: "/notices", labelKey: "nav.notices", icon: "notices" },
];

/**
 * Everything, grouped as the desktop sidebar groups it. The four above are
 * repeated here on purpose: someone who opens "More" is looking for a list of
 * the whole portal, not for the leftovers.
 */
const DRAWER_SECTIONS: { titleKey: string; items: NavEntry[] }[] = [
  {
    titleKey: "nav.records",
    items: [
      { href: "/plots", labelKey: "nav.searchRecords", icon: "search" },
      { href: "/finance", labelKey: "nav.finance", icon: "accounts" },
      { href: "/notices", labelKey: "nav.notices", icon: "notices" },
      { href: "/complaints", labelKey: "nav.complaint", icon: "complaint" },
    ],
  },
  {
    titleKey: "nav.explore",
    items: [
      { href: "/", labelKey: "nav.overview", icon: "home", exact: true },
      { href: "/blocks", labelKey: "nav.blocks", icon: "blocks" },
      { href: "/phases", labelKey: "nav.phases", icon: "phases" },
      { href: "/leaderboard", labelKey: "nav.leaderboard", icon: "leaderboard" },
    ],
  },
];

/** Pages that only exist behind More — used to light up the More tab. */
const DRAWER_ONLY = ["/complaints", "/blocks", "/phases", "/leaderboard"];

export default function MobileBottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const moreIsActive = DRAWER_ONLY.some((href) => isActive(href));

  // Close on navigation.
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Close on a tap outside the panel.
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) setDrawerOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [drawerOpen]);

  // Escape closes it, and the page behind must not scroll under a thumb.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  return (
    <>
      <style>{drawerStyles}</style>

      <div
        className={`more-drawer-backdrop${drawerOpen ? " open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <div
        ref={drawerRef}
        className={`more-drawer${drawerOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.allPages")}
      >
        <div className="more-drawer-header">
          <span className="more-drawer-heading">{t("nav.allPages")}</span>
          <button
            type="button"
            className="more-drawer-close"
            onClick={() => setDrawerOpen(false)}
            aria-label={t("common.close")}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="more-drawer-list">
          {DRAWER_SECTIONS.map((section) => (
            <div key={section.titleKey}>
              <p className="more-drawer-section">{t(section.titleKey)}</p>
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`more-drawer-item${active ? " active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="more-drawer-item-icon">{icons[item.icon](20)}</span>
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <nav className="mobile-bottom-nav" aria-label={t("nav.records")}>
        {PRIMARY_NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-bottom-nav-item${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="mobile-bottom-nav-icon">{icons[item.icon](22)}</span>
              <span className="mobile-bottom-nav-label">{t(item.labelKey)}</span>
              {active && <span className="mobile-bottom-nav-indicator" aria-hidden="true" />}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setDrawerOpen((open) => !open)}
          className={`mobile-bottom-nav-item${moreIsActive ? " active" : ""}`}
          aria-expanded={drawerOpen}
          aria-haspopup="dialog"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <span className="mobile-bottom-nav-icon">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <span className="mobile-bottom-nav-label">{t("nav.more")}</span>
          {moreIsActive && <span className="mobile-bottom-nav-indicator" aria-hidden="true" />}
        </button>
      </nav>
    </>
  );
}

/**
 * Scoped to this component, as the other resident pages do with their own styles.
 * The panel stops above the bar so the bar stays usable while it is open, and it
 * slides in from the inline-end edge so Urdu mirrors correctly.
 */
const drawerStyles = `
  .more-drawer-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(10, 14, 20, 0.45);
    backdrop-filter: blur(2px);
    z-index: 90;
    opacity: 0;
    pointer-events: none;
    transition: opacity 220ms ease;
  }
  .more-drawer-backdrop.open { opacity: 1; pointer-events: auto; }

  .more-drawer {
    position: fixed;
    top: 0;
    inset-inline-end: 0;
    bottom: calc(64px + env(safe-area-inset-bottom));
    width: min(78vw, 290px);
    background: #fff;
    z-index: 91;
    transform: translateX(100%);
    transition: transform 240ms cubic-bezier(0.32, 0.72, 0, 1);
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 24px rgba(15, 23, 42, 0.14);
    border-start-start-radius: 16px;
    overflow: hidden;
  }
  [dir="rtl"] .more-drawer { transform: translateX(-100%); }
  .more-drawer.open, [dir="rtl"] .more-drawer.open { transform: translateX(0); }

  .more-drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px 12px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.07);
    background: #f8fafc;
    flex-shrink: 0;
  }
  .more-drawer-heading {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #94a3b8;
  }
  .more-drawer-close {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: #f1f5f9;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    flex-shrink: 0;
  }
  .more-drawer-close:active { background: #e2e8f0; }

  .more-drawer-list { flex: 1; overflow-y: auto; padding: 8px 0 14px; }
  .more-drawer-section {
    margin: 12px 20px 4px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.11em;
    color: #cbd5e1;
  }
  .more-drawer-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 20px;
    text-decoration: none;
    color: #334155;
    font-size: 14px;
    font-weight: 600;
    transition: background 0.12s;
    border-inline-start: 3px solid transparent;
  }
  .more-drawer-item:active { background: #f8fafc; }
  .more-drawer-item.active {
    color: #059669;
    background: rgba(5, 150, 105, 0.06);
    border-inline-start-color: #059669;
  }
  .more-drawer-item-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #64748b;
    transition: background 0.12s, color 0.12s;
  }
  .more-drawer-item.active .more-drawer-item-icon {
    background: rgba(5, 150, 105, 0.1);
    color: #059669;
  }
`;
