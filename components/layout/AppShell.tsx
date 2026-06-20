"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { ViewTransition } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileBottomNav from "./MobileBottomNav";
import { FeedbackProvider } from "../feedback/FeedbackContext";
import StoreProvider from "../providers/StoreProvider";
import AuthGuard from "../providers/AuthGuard";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "../../utils/i18n";

const SIDEBAR_WIDTH = 260;
const BARE_PATHS = ["/login"];

// ── Pull-to-refresh hook ──────────────────────────────────────────────────────
// Data-driven pages that register a refetch callback will receive the refresh.
// Pages call the global event; AppShell dispatches it.
function usePullToRefresh(onRefresh: () => void, enabled: boolean) {
  const startY = useRef(0);
  const pulling = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const THRESHOLD = 72;

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || refreshing) return;
      if (window.scrollY > 2) return; // only at very top
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    },
    [enabled, refreshing]
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!pulling.current || !enabled || refreshing) return;
      if (window.scrollY > 2) { pulling.current = false; setPullDistance(0); return; }
      const dist = Math.max(0, e.touches[0].clientY - startY.current);
      setPullDistance(Math.min(dist, THRESHOLD * 1.5));
    },
    [enabled, refreshing]
  );

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current || !enabled) return;
    pulling.current = false;
    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      setPullDistance(0);
      await onRefresh();
      // small hold so spinner is visible
      await new Promise((r) => setTimeout(r, 600));
      setRefreshing(false);
    } else {
      setPullDistance(0);
    }
  }, [enabled, pullDistance, onRefresh]);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [enabled, onTouchStart, onTouchMove, onTouchEnd]);

  return { pullDistance, refreshing };
}

// ── AppShell ──────────────────────────────────────────────────────────────────
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // 1023px: sidebar-as-drawer breakpoint (existing)
  const isDrawerMode = useMediaQuery("(max-width: 1023px)");
  // 768px: mobile-specific features (bottom nav, popup, pull-to-refresh)
  const isMobile = useMediaQuery("(max-width: 768px)");
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  useEffect(() => setSidebarOpen(false), [pathname]);

  // Pull-to-refresh: dispatch custom event that data pages listen to
  const handleRefresh = useCallback(() => {
    return new Promise<void>((resolve) => {
      window.dispatchEvent(new CustomEvent("kkb4-refresh"));
      resolve();
    });
  }, []);

  const { pullDistance, refreshing } = usePullToRefresh(handleRefresh, isMobile);

  if (!mounted) return null;

  const isBare = BARE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isBare) {
    return (
      <StoreProvider>
        <AuthGuard>
          <main className="min-h-screen bg-gray-50/60">{children}</main>
        </AuthGuard>
      </StoreProvider>
    );
  }

  return (
    <StoreProvider>
      <AuthGuard>
        <FeedbackProvider>
          <div className="min-h-screen bg-gray-50/60">
            {/* Sidebar: always rendered; on mobile it becomes a drawer overlay */}
            <Sidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              isMobile={isDrawerMode}
              width={SIDEBAR_WIDTH}
            />

            {/* Content column */}
            <div
              className="flex flex-col min-h-screen"
              style={{ paddingLeft: isDrawerMode ? 0 : SIDEBAR_WIDTH }}
            >
              {/* Hide Navbar on ≤768px mobile; show on 769px+ */}
              {!isMobile && <Navbar onMenuClick={() => setSidebarOpen(true)} />}

              {/* Pull-to-refresh indicator (mobile only) */}
              {isMobile && (pullDistance > 8 || refreshing) && (
                <div
                  className="ptr-indicator"
                  style={{ opacity: refreshing ? 1 : Math.min(1, pullDistance / 72) }}
                  aria-hidden="true"
                >
                  <svg
                    className={`ptr-spinner${refreshing ? " ptr-spinning" : ""}`}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                  </svg>
                </div>
              )}

              <main className="flex-1 w-full" style={{ paddingBottom: isMobile ? "calc(64px + env(safe-area-inset-bottom))" : 0 }}>
                <ViewTransition>
                  {children}
                </ViewTransition>
              </main>
            </div>

            {/* Mobile bottom nav — fixed, ≤768px only */}
            {isMobile && <MobileBottomNav />}
          </div>
        </FeedbackProvider>
      </AuthGuard>
    </StoreProvider>
  );
}
