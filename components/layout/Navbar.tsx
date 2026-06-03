"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "../../store";
import { logout } from "../../store/slices/authSlice";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const resident = useSelector((state: RootState) => state.auth.resident);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  // ── Breadcrumb / page title from the current route ──────────────────
  const SECTION_LABEL: Record<string, string> = {
    blocks: t("nav.blocks"),
    phases: t("nav.phases"),
    plots: t("nav.plots"),
    leaderboard: t("nav.leaderboard"),
    notices: t("nav.myNotices"),
  };

  const parts = pathname.split("/").filter(Boolean);
  const overviewCrumb = { label: t("nav.overview"), href: "/" };

  let title: string;
  let parents: { label: string; href: string }[];

  if (parts.length === 0) {
    title = t("nav.overview");
    parents = [];
  } else {
    const [section, sub] = parts;
    const sectionLabel =
      SECTION_LABEL[section] ?? section.charAt(0).toUpperCase() + section.slice(1);
    if (!sub) {
      title = sectionLabel;
      parents = [overviewCrumb];
    } else {
      if (section === "plots") {
        title =
          resident && sub === resident.id
            ? resident.plotBlock || t("nav.myPlot")
            : t("common.details");
      } else {
        title = decodeURIComponent(sub);
      }
      parents = [overviewCrumb, { label: sectionLabel, href: `/${section}` }];
    }
  }

  const initial = (resident?.ownerName || resident?.plotBlock || "?")
    .slice(0, 1)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/70 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex items-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8">
      {/* ── Left: menu + title/breadcrumb + search ── */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="lg:hidden shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl text-gray-700 border border-gray-200 bg-white hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>

        <div className="min-w-0">
          {parents.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-gray-400 leading-none mb-0.5"
            >
              {parents.map((c, i) => (
                <span key={c.href} className="flex items-center gap-1">
                  {i > 0 && <span className="text-gray-300">/</span>}
                  <Link href={c.href} className="hover:text-emerald-600 transition">
                    {c.label}
                  </Link>
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-[15px] sm:text-base font-bold text-gray-900 leading-tight truncate">
            {title}
          </h1>
        </div>

      </div>

      {/* ── Right: profile · language · logout ── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {resident && (
          <div className="hidden sm:flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-emerald-100 bg-emerald-50/60">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
              {initial}
            </div>
            <div className="leading-tight">
              <p className="text-[12px] font-bold text-gray-900 truncate max-w-40">
                {resident.ownerName || resident.plotBlock}
              </p>
              <p className="text-[10.5px] text-emerald-700 font-semibold tabular-nums">
                {resident.plotBlock}
              </p>
            </div>
          </div>
        )}

        {resident && <div className="hidden sm:block w-px h-7 bg-gray-200" aria-hidden="true" />}

        {resident && (
          <button
            type="button"
            onClick={handleLogout}
            aria-label={t("nav.logout")}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-[12.5px] font-semibold text-gray-700 hover:border-rose-300 hover:text-rose-700 hover:bg-rose-50 transition"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">{t("nav.logout")}</span>
          </button>
        )}
      </div>
    </header>
  );
}
