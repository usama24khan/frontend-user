"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSwipe } from "../../hooks/useSwipe";

const navItems = [
  {
    href: "/",
    label: "Overview",
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
    label: "Blocks",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/phases",
    label: "Phases",
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
    label: "Leaderboard",
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
  const pathname = usePathname();
  const swipeRef = useSwipe<HTMLElement>({
    onSwipeLeft: onClose,
    enabled: isMobile && open,
  });

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
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-bold text-[15px] shadow-md shadow-emerald-500/25">
          K4
        </div>
        <div>
          <p className="text-[15px] font-bold text-gray-900 leading-tight tracking-tight">KKB4</p>
          <p className="text-[11px] text-gray-500 font-medium">Maintenance</p>
        </div>
      </div>

      <p className="px-3 mb-2 section-label">Explore</p>

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
              <span>{item.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl bg-linear-to-br from-emerald-50 to-white border border-emerald-100 px-4 py-4 mt-4">
        <p className="text-[10px] text-emerald-700 font-bold tracking-wider uppercase">
          KKB4 Housing Society
        </p>
        <p className="text-[12px] font-semibold text-gray-700 mt-1">Resident Portal</p>
        <p className="text-[11px] text-gray-500 mt-0.5">v1.0.0</p>
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
          className="drawer-panel animate-drawer-in flex flex-col px-4 py-7"
        >
          {content}
        </aside>
      </>
    );
  }

  return (
    <aside
      className="hidden lg:flex fixed left-0 top-0 h-screen bg-white border-r border-gray-100 px-4 py-7 flex-col z-40"
      style={{ width }}
    >
      {content}
    </aside>
  );
}
