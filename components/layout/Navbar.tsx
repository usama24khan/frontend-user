"use client";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { setLanguage } from "../../store/slices/uiSlice";

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.ui.language);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "ur" : "en";
    dispatch(setLanguage(newLang));
    document.documentElement.dir = newLang === "ur" ? "rtl" : "ltr";
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "0.5px solid rgba(0,0,0,0.06)",
        height: 54,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      <button
        onClick={onMenuClick}
        style={{
          display: "none",
          padding: 6,
          background: "none",
          border: "none",
          cursor: "pointer",
          borderRadius: 6,
          color: "#6b7280",
        }}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div />

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={toggleLanguage}
          style={{
            padding: "5px 14px",
            border: "0.5px solid rgba(0,0,0,0.12)",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 500,
            color: "#6b7280",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "background 0.15s",
          }}
        >
          <span style={{ fontSize: 13 }}>🌐</span>
          <span>{language === "en" ? "اردو" : "EN"}</span>
        </button>
      </div>
    </header>
  );
}
