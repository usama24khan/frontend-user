"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { useSwipe } from "../../hooks/useSwipe";
import { getAppMode, type AppMode } from "../../services/configService";

const navItems = [
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
  const resident = useSelector((s: RootState) => s.auth.resident);
  const [appMode, setAppMode] = useState<AppMode | null>(null);
  const swipeRef = useSwipe<HTMLElement>({
    onSwipeLeft: onClose,
    enabled: isMobile && open,
  });

  const myAccountItems = resident
    ? [
        {
          href: `/plots/${resident.id}`,
          labelKey: "nav.myPlot",
          icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V9.5z" />
            </svg>
          ),
          trailing: resident.plotBlock,
        },
        {
          href: "/notices",
          labelKey: "nav.myNotices",
          icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
              <path d="M14 2v6h6" />
            </svg>
          ),
          trailing: null as string | null,
        },
      ]
    : null;

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

      {myAccountItems && (
        <>
          <p className="px-3 mb-2 section-label">{t("nav.myAccount")}</p>
          <nav className="flex flex-col gap-1">
            {myAccountItems.map((item) => {
              // For /plots/[id] we want active on any sub-path; for /notices we
              // need exact match so the broader Explore-side /plots route below
              // doesn't trigger this entry by accident.
              const active = item.href.startsWith("/plots/")
                ? pathname.startsWith(item.href)
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={isMobile ? onClose : undefined}
                  className={`sidebar-link ${active ? "active" : ""}`}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span>{t(item.labelKey)}</span>
                  {item.trailing && (
                    <span className="ml-auto text-[10.5px] font-bold text-emerald-700 tabular-nums">
                      {item.trailing}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </>
      )}

      <p className={`px-3 mb-2 section-label ${myAccountItems ? "mt-6" : ""}`}>
        {t("nav.explore")}
      </p>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
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
        })}
      </nav>

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
