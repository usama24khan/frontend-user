"use client";

/**
 * Mobile header: a back affordance and the page's name.
 *
 * The Navbar is hidden below 768px, which left phones with no top chrome at all
 * — the only way back from an inner page like /plots/<id> was the browser's own
 * gesture, and nothing at all inside an installed PWA. This fills that gap for
 * every route except the overview, which has nowhere above it to go.
 *
 * The public /view document pages never reach here: AppShell returns those
 * before the portal chrome is rendered.
 */

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

/** Section slug -> translation key for its label. */
const SECTION_LABEL_KEY: Record<string, string> = {
  plots: "nav.searchRecords",
  finance: "nav.finance",
  blocks: "nav.blocks",
  map: "nav.map",
  phases: "nav.phases",
  leaderboard: "nav.leaderboard",
  notices: "nav.notices",
  complaints: "nav.complaint",
};

/**
 * Sections whose inner segment is a short code that reads poorly alone — "A" next
 * to a back arrow says very little — so it is expanded into a full name.
 */
const NAMED_SUB_SECTIONS: Record<string, string> = {
  blocks: "societyMap.blockNamed",
};

/**
 * Sections whose inner route is keyed by an id, so the URL segment is an
 * ObjectId and useless as a heading.
 */
const OPAQUE_SUB_SECTIONS = new Set(["plots"]);

export default function MobileTopBar() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * How many in-app navigations have happened since load.
   *
   * With history behind us, `router.back()` is the better answer — it returns to
   * wherever the user actually came from, which for a plot opened out of a block
   * listing is that listing rather than the plots index. On a cold load, a
   * deep link or a page opened straight after login, there is nothing to go back
   * to and `back()` would leave the app, so the parent route is used instead.
   */
  const navCount = useRef(0);
  const firstPath = useRef(pathname);
  useEffect(() => {
    if (pathname !== firstPath.current) navCount.current += 1;
  }, [pathname]);

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null; // overview: nothing above it

  const [section, ...rest] = parts;
  const sub = rest[0];
  const sectionLabel = SECTION_LABEL_KEY[section]
    ? t(SECTION_LABEL_KEY[section])
    : section.charAt(0).toUpperCase() + section.slice(1);

  const namedKey = NAMED_SUB_SECTIONS[section];
  const title = !sub
    ? sectionLabel
    : OPAQUE_SUB_SECTIONS.has(section)
      ? t("common.details")
      : namedKey
        ? t(namedKey, { block: decodeURIComponent(sub) })
        : decodeURIComponent(sub);

  const parentHref = sub ? `/${section}` : "/";

  const goBack = () => {
    if (navCount.current > 0) router.back();
    else router.push(parentHref);
  };

  return (
    <header className="mtb">
      <style>{styles}</style>
      <button type="button" className="mtb-back" onClick={goBack} aria-label={t("common.back")}>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="mtb-title">{title}</span>
    </header>
  );
}

const styles = `
  .mtb {
    position: sticky; top: 0; z-index: 30;
    display: flex; align-items: center; gap: 10px;
    padding: 8px 12px;
    padding-top: calc(8px + env(safe-area-inset-top));
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0,0,0,0.07);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  [dir="rtl"] .mtb { font-family: 'Noto Nastaliq Urdu', 'Plus Jakarta Sans', sans-serif; }

  .mtb-back {
    flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    width: 40px; height: 40px;
    /* A 40px box with a 44px tap area: the negative margin keeps the header
       compact without shrinking the target below the comfortable minimum. */
    margin: -2px; padding: 2px;
    border-radius: 10px; border: 1px solid rgba(0,0,0,0.08);
    background: #fff; color: #334155; cursor: pointer;
  }
  .mtb-back:active { background: #f1f5f9; }
  /* The chevron points the way you came, which reverses in Urdu. */
  [dir="rtl"] .mtb-back svg { transform: scaleX(-1); }

  .mtb-title {
    min-width: 0; flex: 1;
    font-size: 15px; font-weight: 700; color: #0f172a;
    letter-spacing: -0.2px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  /* Nastaliq is clipped by a single Latin-height line box, so give it room. */
  [dir="rtl"] .mtb-title { line-height: 1.9; white-space: normal; }
`;
