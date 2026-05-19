"use client";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import StoreProvider from "../providers/StoreProvider";
import "../../utils/i18n";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <StoreProvider>
      <div style={{ display: "flex", minHeight: "100vh", background: "#fafafa" }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div style={{ flex: 1, marginLeft: 240 }}>
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main>{children}</main>
        </div>
      </div>
    </StoreProvider>
  );
}
