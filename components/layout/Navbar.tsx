"use client";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { setLanguage } from "../../store/slices/uiSlice";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.ui.language);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "ur" : "en";
    dispatch(setLanguage(newLang));
    document.documentElement.dir = newLang === "ur" ? "rtl" : "ltr";
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/85 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl text-gray-700 border border-gray-200 bg-white hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>

        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">
            K4
          </div>
          <span className="text-[13px] font-bold text-gray-900">KKB4</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleLanguage}
          aria-label="Toggle language"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-[12.5px] font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
          </svg>
          <span>{language === "en" ? "اردو" : "EN"}</span>
        </button>
      </div>
    </header>
  );
}
