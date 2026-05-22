"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import StoreProvider from "../providers/StoreProvider";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "../../utils/i18n";

const SIDEBAR_WIDTH = 260;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  useEffect(() => setSidebarOpen(false), [pathname]);

  if (!mounted) return null;

  return (
    <StoreProvider>
      <div className="min-h-screen bg-gray-50/60">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
          width={SIDEBAR_WIDTH}
        />

        <div
          className="flex flex-col min-h-screen"
          style={{ paddingLeft: isMobile ? 0 : SIDEBAR_WIDTH }}
        >
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 w-full">{children}</main>
        </div>
      </div>
    </StoreProvider>
  );
}
