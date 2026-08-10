"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSwipe } from "../../hooks/useSwipe";
import { getAppMode, type AppMode } from "../../services/configService";

// The portal is one shared account, so there's no per-resident section here —
// every item is available to whoever is signed in.
const recordItems = [
  {
    href: "/plots",
    labelKey: "nav.searchRecords",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4.5-4.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/notices",
    labelKey: "nav.notices",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
        <path d="M14 2v6h6" />
      </svg>
    ),
  },
  {
    href: "/complaints",
    labelKey: "nav.complaint",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
  },
];

const exploreItems = [
  {
    href: "/",
    labelKey: "nav.overview",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/blocks",
    labelKey: "nav.blocks",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/phases",
    labelKey: "nav.phases",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    href: "/leaderboard",
    labelKey: "nav.leaderboard",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path d="M8 21V11M12 21V3M16 21v-6" strokeLinecap="round" />
      </svg>
    ),
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  width?: number;
}

export default function Sidebar({ open, onClose, isMobile, width = 260 }: SidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [appMode, setAppMode] = useState<AppMode | null>(null);
  const swipeRef = useSwipe<HTMLElement>({
    onSwipeLeft: onClose,
    enabled: isMobile && open,
  });

  useEffect(() => {
    getAppMode().then(setAppMode);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [open, isMobile, onClose]);

  const renderItems = (items: typeof recordItems) =>
    items.map((item) => {
      const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={isMobile ? onClose : undefined}
          className={`sidebar-link ${active ? "active" : ""}`}
        >
          <span className="sidebar-icon">{item.icon}</span>
          <span>{t(item.labelKey)}</span>
        </Link>
      );
    });

  const content = (
    <>
      <div className="flex items-center gap-3 px-1 pb-5 mb-4 border-b border-gray-100">
        <img src="/icons/logo.png" alt="KKB4" className="shrink-0 w-10 h-10 rounded-xl object-contain" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-bold text-gray-900 leading-tight tracking-tight">KKB4</p>
            {appMode === "test" && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-amber-100 text-amber-700 border border-amber-300 select-none">
                TEST
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 font-medium truncate">{t("app.residentPortal")}</p>
        </div>
      </div>

      <p className="px-3 mb-2 section-label">{t("nav.records")}</p>
      <nav className="flex flex-col gap-1">{renderItems(recordItems)}</nav>

      <p className="px-3 mb-2 mt-6 section-label">{t("nav.explore")}</p>
      <nav className="flex flex-col gap-1 flex-1">{renderItems(exploreItems)}</nav>

      <div className="mt-4 pt-4 px-3 border-t border-gray-100">
        <p className="text-[11px] font-semibold text-gray-500">{t("app.society")}</p>
        <p className="text-[10.5px] text-gray-400 mt-0.5 tabular-nums">{t("app.version")}</p>
      </div>
    </>
  );

  if (isMobile) {
    if (!open) return null;
    return (
      <>
        <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
        <aside
          ref={swipeRef as unknown as React.RefObject<HTMLElement>}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className="drawer-panel animate-drawer-in flex flex-col px-5 py-7"
        >
          {content}
        </aside>
      </>
    );
  }

  return (
    <aside
      className="hidden lg:flex fixed left-0 top-0 h-screen bg-white border-r border-gray-100 px-5 py-7 flex-col z-40"
      style={{ width }}
    >
      {content}
    </aside>
  );
}
