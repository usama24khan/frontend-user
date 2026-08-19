// AUTO-COPIED from frontend-admin by scripts/sync-society-map.mjs — do not edit here.
"use client";

/**
 * SocietyMap — an interactive, resolution-independent SVG rendering of the KKB4
 * site plan. Geometry and plot numbers live in `constants/societyMap`; this file
 * only draws them and handles zoom / pan / selection.
 *
 * Shared by the admin and resident apps. Keep it props-driven so the two can
 * differ in behaviour without forking the component — the admin tints plots by
 * dues and opens a modal, the resident app shows the printed legend colours and
 * a detail card. Synced by `scripts/sync-society-map.mjs`.
 *
 * Touch is a first-class input here: residents will open this on a phone, so it
 * supports one-finger pan, two-finger pinch, and tap-to-select, and it keeps
 * hover tooltips for mouse only (a sticky tooltip after a tap is just litter).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PLOTS,
  ZONES,
  ROADS,
  ROAD_LABELS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  PARK_COLOR,
  GROUND_COLOR,
  ROAD_COLOR,
  MAP_VIEWBOX,
  type PlotCategory,
  type PlotShape,
} from "../constants/societyMap";

/** Per-plot overlay supplied by the page (dues, allotment, owner, …). */
export interface PlotState {
  color?: string;
  label?: string;
  ownerName?: string;
}

export interface SocietyMapProps {
  /** Keyed by plot number as a string, or by `${number}-${block}` for exactness. */
  plotStates?: Record<string, PlotState>;
  /** Tint plots from `plotStates` rather than from the printed legend colours. */
  colorBy?: "legend" | "state";
  onPlotClick?: (plot: PlotShape) => void;
  /** Plot numbers to ring in accent — e.g. a search result. */
  highlight?: number[];
  /** Plot id (`${number}-${block}`) to mark as the current selection. */
  selectedId?: string | null;
  /** Dim every plot outside this block. */
  focusBlock?: string | null;
  /** Max height of the map viewport. The frame otherwise follows the plan's
   *  aspect ratio, so this only bites on tall windows. */
  height?: number;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 14;
/** Movement (px) above which a pointer sequence is a drag, not a tap. */
const TAP_SLOP = 8;
/** Plot labels are drawn only once a cell is at least this tall on screen. */
const MIN_LABEL_PX = 9;

const VB_CX = MAP_VIEWBOX.x + MAP_VIEWBOX.w / 2;
const VB_CY = MAP_VIEWBOX.y + MAP_VIEWBOX.h / 2;

/** Text that reads legibly on a given cell fill. */
function inkFor(bg: string): string {
  const hex = bg.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // Rec. 709 luma — the maroon and dark-slate fills need light ink, the rest dark.
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140 ? "#12222b" : "#f2f6f7";
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Bounding box per block, used to frame it on demand.
 *
 * Measured over the block's RING only — its regular and odd-size plots. The
 * prime and mortgage plots are attributed to the block they adjoin, and those
 * strips sprawl: block A carries the entire boundary ring, so including them
 * would make "focus A" barely zoom at all.
 */
const BLOCK_BOUNDS: Record<string, { x: number; y: number; w: number; h: number }> = (() => {
  const acc: Record<string, { x0: number; y0: number; x1: number; y1: number }> = {};
  const ring = PLOTS.filter((p) => p.category === "regular" || p.category === "odd");
  for (const p of ring) {
    const b = (acc[p.block] ??= { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
    b.x0 = Math.min(b.x0, p.x);
    b.y0 = Math.min(b.y0, p.y);
    b.x1 = Math.max(b.x1, p.x + p.w);
    b.y1 = Math.max(b.y1, p.y + p.h);
  }
  return Object.fromEntries(
    Object.entries(acc).map(([k, b]) => [k, { x: b.x0, y: b.y0, w: b.x1 - b.x0, h: b.y1 - b.y0 }]),
  );
})();

/**
 * Keep the view over the map. The slack is exactly the part of the map that does
 * not fit on screen at this zoom: zero at fit-to-width (so a stray finger cannot
 * drag the plan off into empty space) growing to half the map when zoomed in far
 * enough that every corner needs to be reachable.
 */
const clampPan = (p: { x: number; y: number }, zoom: number) => {
  const slackX = (MAP_VIEWBOX.w * (1 - 1 / zoom)) / 2;
  const slackY = (MAP_VIEWBOX.h * (1 - 1 / zoom)) / 2;
  return { x: clamp(p.x, -slackX, slackX), y: clamp(p.y, -slackY, slackY) };
};

export default function SocietyMap({
  plotStates,
  colorBy = "legend",
  onPlotClick,
  highlight,
  selectedId = null,
  focusBlock = null,
  height = 620,
}: SocietyMapProps) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState<PlotShape | null>(null);
  const [hidden, setHidden] = useState<Set<PlotCategory>>(new Set());
  const frameRef = useRef<HTMLDivElement>(null);

  // The hover card and the gesture maths both need the frame's pixel size during
  // render, which a ref cannot provide.
  const [frame, setFrame] = useState({ w: MAP_VIEWBOX.w, h: MAP_VIEWBOX.h });

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setFrame({ w: entry.contentRect.width, h: entry.contentRect.height }),
    );
    ro.observe(el);
    setFrame({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const highlightSet = useMemo(() => new Set(highlight ?? []), [highlight]);

  /** Screen pixels per map unit at the current zoom. */
  const pxPerUnit = (frame.w / MAP_VIEWBOX.w) * zoom;

  const viewBox = useMemo(() => {
    const w = MAP_VIEWBOX.w / zoom;
    const h = MAP_VIEWBOX.h / zoom;
    return `${VB_CX - pan.x - w / 2} ${VB_CY - pan.y - h / 2} ${w} ${h}`;
  }, [zoom, pan]);

  /* ── Gestures ───────────────────────────────────────────────────────────── */

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    mode: "pan" | "pinch";
    startZoom: number;
    startPan: { x: number; y: number };
    startDist: number;
    /** Anchor in map coords, held still while zooming. */
    anchor: { x: number; y: number };
    /** Anchor as a fraction of the frame, so it stays under the fingers. */
    anchorFrac: { x: number; y: number };
    from: { x: number; y: number };
    moved: number;
  } | null>(null);
  /** Set when a pointer sequence turned into a drag, so it doesn't also click. */
  const dragged = useRef(false);

  /**
   * Rewrite `pan` so that map point `anchor` sits at frame fraction `frac`
   * under `nextZoom`. This is what makes pinch and wheel zoom feel anchored
   * rather than always pulling toward the centre.
   */
  const panForAnchor = useCallback(
    (
      anchor: { x: number; y: number },
      frac: { x: number; y: number },
      nextZoom: number,
    ) => {
      const w = MAP_VIEWBOX.w / nextZoom;
      const h = MAP_VIEWBOX.h / nextZoom;
      return clampPan(
        {
          x: VB_CX - w / 2 + frac.x * w - anchor.x,
          y: VB_CY - h / 2 + frac.y * h - anchor.y,
        },
        nextZoom,
      );
    },
    [],
  );

  const frameRect = () => frameRef.current?.getBoundingClientRect();

  /** Client coords -> map coords, at the current zoom/pan. */
  const toMap = useCallback(
    (cx: number, cy: number, rect: DOMRect) => {
      const w = MAP_VIEWBOX.w / zoom;
      const h = MAP_VIEWBOX.h / zoom;
      return {
        x: VB_CX - pan.x - w / 2 + ((cx - rect.left) / rect.width) * w,
        y: VB_CY - pan.y - h / 2 + ((cy - rect.top) / rect.height) * h,
      };
    },
    [zoom, pan],
  );

  const centreOf = (pts: { x: number; y: number }[]) => ({
    x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
    y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
  });

  const beginGesture = useCallback(() => {
    const rect = frameRect();
    if (!rect) return;
    const pts = [...pointers.current.values()];
    const c = centreOf(pts);
    const dist =
      pts.length >= 2
        ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        : 0;
    gesture.current = {
      mode: pts.length >= 2 ? "pinch" : "pan",
      startZoom: zoom,
      startPan: pan,
      startDist: dist,
      anchor: toMap(c.x, c.y, rect),
      anchorFrac: {
        x: (c.x - rect.left) / rect.width,
        y: (c.y - rect.top) / rect.height,
      },
      from: c,
      moved: 0,
    };
  }, [zoom, pan, toMap]);

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) dragged.current = false;
    beginGesture();
    frameRef.current?.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const rect = frameRect();
    if (!g || !rect) return;

    const pts = [...pointers.current.values()];
    const c = centreOf(pts);
    g.moved = Math.max(g.moved, Math.hypot(c.x - g.from.x, c.y - g.from.y));
    if (g.moved > TAP_SLOP) dragged.current = true;

    if (g.mode === "pinch" && pts.length >= 2 && g.startDist > 0) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const next = clamp((dist / g.startDist) * g.startZoom, MIN_ZOOM, MAX_ZOOM);
      setZoom(next);
      setPan(panForAnchor(g.anchor, g.anchorFrac, next));
      return;
    }

    // One finger (or the mouse held down): pan by the pointer delta, converted
    // from screen pixels back into map units.
    const perUnit = (rect.width / MAP_VIEWBOX.w) * g.startZoom;
    setPan(
      clampPan(
        {
          x: g.startPan.x + (c.x - g.from.x) / perUnit,
          y: g.startPan.y + (c.y - g.from.y) / perUnit,
        },
        zoom,
      ),
    );
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) gesture.current = null;
    // Lifting one finger of a pinch: re-baseline so the remaining finger pans
    // smoothly instead of jumping.
    else beginGesture();
  };

  // Wheel is attached natively because React's synthetic wheel listener is
  // passive, and a passive listener may not call preventDefault().
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const next = clamp(zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12), MIN_ZOOM, MAX_ZOOM);
      if (next === zoom) return;
      const w = MAP_VIEWBOX.w / zoom;
      const h = MAP_VIEWBOX.h / zoom;
      const frac = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
      // Zoom toward the cursor rather than the centre.
      const anchor = {
        x: VB_CX - pan.x - w / 2 + frac.x * w,
        y: VB_CY - pan.y - h / 2 + frac.y * h,
      };
      setZoom(next);
      setPan(panForAnchor(anchor, frac, next));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom, pan, panForAnchor]);

  /** Zoom about the frame centre — used by the +/− buttons. */
  const nudgeZoom = (factor: number) => {
    const next = clamp(zoom * factor, MIN_ZOOM, MAX_ZOOM);
    if (next === zoom) return;
    const w = MAP_VIEWBOX.w / zoom;
    const h = MAP_VIEWBOX.h / zoom;
    const centre = { x: 0.5, y: 0.5 };
    const anchor = {
      x: VB_CX - pan.x - w / 2 + 0.5 * w,
      y: VB_CY - pan.y - h / 2 + 0.5 * h,
    };
    setZoom(next);
    setPan(panForAnchor(anchor, centre, next));
  };

  const reset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  /**
   * Focusing a block frames it. Without this, `focusBlock` only dims the others,
   * which on a phone still leaves the user pinching around to find it.
   *
   * Done as a guarded render-phase adjustment rather than an effect: this is
   * "reset some state when a prop changes", which React resolves in the same
   * pass instead of painting the stale view first.
   */
  const [lastFocus, setLastFocus] = useState(focusBlock);
  if (focusBlock !== lastFocus) {
    setLastFocus(focusBlock);
    const b = focusBlock ? BLOCK_BOUNDS[focusBlock] : null;
    if (!b) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      const pad = 1.25; // leave the surrounding streets visible for context
      const next = clamp(
        Math.min(MAP_VIEWBOX.w / (b.w * pad), MAP_VIEWBOX.h / (b.h * pad)),
        MIN_ZOOM,
        MAX_ZOOM,
      );
      setZoom(next);
      setPan(clampPan({ x: VB_CX - (b.x + b.w / 2), y: VB_CY - (b.y + b.h / 2) }, next));
    }
  }

  const stateFor = useCallback(
    (plot: PlotShape): PlotState | undefined =>
      plotStates?.[plot.id] ?? plotStates?.[String(plot.number)],
    [plotStates],
  );

  const fillFor = useCallback(
    (plot: PlotShape): string => {
      if (colorBy === "state") return stateFor(plot)?.color ?? "#e6ebee";
      return CATEGORY_COLORS[plot.category];
    },
    [colorBy, stateFor],
  );

  const toggleCategory = (cat: PlotCategory) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

  const visible = useMemo(() => PLOTS.filter((p) => !hidden.has(p.category)), [hidden]);

  return (
    <div className="smap">
      <style>{styles}</style>

      <div className="smap-toolbar">
        <div className="smap-legend">
          {CATEGORY_ORDER.map((cat) => {
            const off = hidden.has(cat);
            return (
              <button
                key={cat}
                type="button"
                className={`smap-legend-item${off ? " is-off" : ""}`}
                onClick={() => toggleCategory(cat)}
                aria-pressed={!off}
              >
                <span className="smap-swatch" style={{ background: CATEGORY_COLORS[cat] }} />
                <span className="smap-legend-text">
                  {t(`societyMap.category.${cat}`, { defaultValue: CATEGORY_LABELS[cat] })}
                </span>
              </button>
            );
          })}
          <span className="smap-legend-item is-static">
            <span className="smap-swatch" style={{ background: PARK_COLOR }} />
            <span className="smap-legend-text">{t("societyMap.parks")}</span>
          </span>
        </div>

        <div className="smap-zoom">
          <button
            type="button"
            onClick={() => nudgeZoom(1 / 1.4)}
            aria-label={t("societyMap.zoomOut")}
          >
            −
          </button>
          <span className="smap-zoom-value">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => nudgeZoom(1.4)} aria-label={t("societyMap.zoomIn")}>
            +
          </button>
          <button type="button" className="smap-reset" onClick={reset}>
            {t("societyMap.fit")}
          </button>
        </div>
      </div>

      <div
        className="smap-frame"
        ref={frameRef}
        // Match the plan's own aspect ratio so fit-to-width leaves no dead band
        // above and below on a phone; the cap stops it dominating a tall desktop
        // window, at which point the SVG letterboxes sideways instead.
        style={{
          aspectRatio: `${MAP_VIEWBOX.w} / ${MAP_VIEWBOX.h}`,
          maxHeight: `min(${height}px, 78vh)`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onPointerLeave={(e) => {
          endPointer(e);
          setHover(null);
        }}
      >
        <svg viewBox={viewBox} className="smap-svg" role="img" aria-label={t("societyMap.svgLabel")}>
          <rect
            x={MAP_VIEWBOX.x}
            y={MAP_VIEWBOX.y}
            width={MAP_VIEWBOX.w}
            height={MAP_VIEWBOX.h}
            fill={GROUND_COLOR}
            rx={4}
          />
          {ROADS.map((r, i) => (
            <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={ROAD_COLOR} />
          ))}
          {ROAD_LABELS.map((l, i) => (
            <text
              key={i}
              x={l.x}
              y={l.y}
              className="smap-road-label"
              transform={l.vertical ? `rotate(-90 ${l.x} ${l.y})` : undefined}
            >
              {l.text}
            </text>
          ))}

          {ZONES.map((z) => {
            const bg = z.kind === "park" ? PARK_COLOR : CATEGORY_COLORS.amenity;
            const isBlockPark = z.id.startsWith("park-") && z.label.length === 1;
            return (
              <g key={z.id}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h} fill={bg} rx={1.5} />
                <text
                  x={z.x + z.w / 2}
                  y={z.y + z.h / 2}
                  className={isBlockPark ? "smap-park-label" : "smap-zone-label"}
                  fill={inkFor(bg)}
                  style={
                    isBlockPark
                      ? undefined
                      : { fontSize: Math.min(9, (z.vertical ? z.h : z.w) / 7) }
                  }
                  transform={
                    z.vertical ? `rotate(-90 ${z.x + z.w / 2} ${z.y + z.h / 2})` : undefined
                  }
                >
                  {isBlockPark ? (
                    <>
                      <tspan x={z.x + z.w / 2} dy="-1">
                        {z.label}
                      </tspan>
                      <tspan x={z.x + z.w / 2} dy="9" className="smap-park-sub">
                        {t("societyMap.blockUpper")}
                      </tspan>
                    </>
                  ) : (
                    t(`societyMap.zone.${z.id}`, { defaultValue: z.label })
                  )}
                </text>
              </g>
            );
          })}

          {visible.map((plot) => {
            const fill = fillFor(plot);
            const dimmed = focusBlock != null && plot.block !== focusBlock;
            const hot = highlightSet.has(plot.number);
            const active = selectedId === plot.id || hover?.id === plot.id;
            // Compare against on-screen size, not map units: at fit-to-width on a
            // phone a cell is ~5px tall and its number would be illegible mush.
            const labelPx = plot.h * pxPerUnit;
            return (
              <g
                key={plot.id}
                className={`smap-plot${dimmed ? " is-dim" : ""}`}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setHover(plot);
                }}
                onClick={() => {
                  // A pan that happened to finish over a plot is not a selection.
                  if (dragged.current) return;
                  onPlotClick?.(plot);
                }}
              >
                <rect
                  x={plot.x + 0.4}
                  y={plot.y + 0.4}
                  width={Math.max(plot.w - 0.8, 0.5)}
                  height={Math.max(plot.h - 0.8, 0.5)}
                  fill={fill}
                  stroke={
                    selectedId === plot.id
                      ? "#0f172a"
                      : hot
                        ? "#059669"
                        : active
                          ? "#0f172a"
                          : "rgba(15,23,42,0.45)"
                  }
                  strokeWidth={selectedId === plot.id ? 2 : hot ? 1.6 : active ? 1.2 : 0.35}
                  strokeDasharray={plot.uncertain ? "2 1.4" : undefined}
                  rx={0.8}
                />
                {labelPx >= MIN_LABEL_PX && (
                  <text
                    x={plot.x + plot.w / 2}
                    y={plot.y + plot.h / 2}
                    className="smap-plot-number"
                    fill={inkFor(fill)}
                    style={{ fontSize: Math.min(plot.w * 0.52, plot.h * 0.62, 11) }}
                  >
                    {plot.uncertain ? `${plot.number}?` : plot.number}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {hover && (
          <HoverCard plot={hover} state={stateFor(hover)} zoom={zoom} pan={pan} frame={frame} />
        )}
      </div>

      <p className="smap-hint">
        <span className="smap-hint-desktop">{t("societyMap.hintDesktop")}</span>
        <span className="smap-hint-touch">{t("societyMap.hintTouch")}</span>{" "}
        {t("societyMap.hintDashed")}
      </p>
    </div>
  );
}

/* ─── Hover card (mouse only) ──────────────────────────────────────────────── */

function HoverCard({
  plot,
  state,
  zoom,
  pan,
  frame,
}: {
  plot: PlotShape;
  state?: PlotState;
  zoom: number;
  pan: { x: number; y: number };
  frame: { w: number; h: number };
}) {
  const { t } = useTranslation();
  // Project the plot's map coordinates back into frame pixels.
  const vbW = MAP_VIEWBOX.w / zoom;
  const vbH = MAP_VIEWBOX.h / zoom;
  const vbX = VB_CX - pan.x - vbW / 2;
  const vbY = VB_CY - pan.y - vbH / 2;
  const left = ((plot.x + plot.w / 2 - vbX) / vbW) * frame.w;
  const top = ((plot.y - vbY) / vbH) * frame.h;

  return (
    <div className="smap-tip" style={{ left, top }}>
      <div className="smap-tip-head">
        <strong>{plot.number}</strong>
        <span className="smap-tip-block">
          {t("societyMap.blockNamed", { block: plot.block })}
        </span>
      </div>
      <div className="smap-tip-cat">
        <span className="smap-swatch" style={{ background: CATEGORY_COLORS[plot.category] }} />
        {t(`societyMap.category.${plot.category}`, {
          defaultValue: CATEGORY_LABELS[plot.category],
        })}
      </div>
      {state?.ownerName && <div className="smap-tip-owner">{state.ownerName}</div>}
      {state?.label && <div className="smap-tip-label">{state.label}</div>}
      {plot.uncertain && <div className="smap-tip-warn">{t("societyMap.unverified")}</div>}
    </div>
  );
}

/* ─── Styles ───────────────────────────────────────────────────────────────── */

const styles = `
  .smap * { box-sizing: border-box; }
  .smap { font-family: 'Plus Jakarta Sans', sans-serif; }

  .smap-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; flex-wrap: wrap; margin-bottom: 10px;
  }
  .smap-legend { display: flex; gap: 6px; flex-wrap: wrap; min-width: 0; }
  .smap-legend-item {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: inherit; font-size: 11px; font-weight: 600; color: #334155;
    background: #fff; border: 1px solid rgba(0,0,0,0.1); border-radius: 99px;
    padding: 5px 11px 5px 7px; cursor: pointer;
    transition: opacity .15s, border-color .15s;
  }
  .smap-legend-item:hover { border-color: rgba(0,0,0,0.22); }
  .smap-legend-item.is-off { opacity: 0.4; }
  .smap-legend-item.is-static { cursor: default; }
  .smap-swatch {
    width: 11px; height: 11px; border-radius: 3px; flex-shrink: 0;
    border: 1px solid rgba(0,0,0,0.18);
  }

  .smap-zoom {
    display: flex; align-items: center; gap: 4px; background: #fff;
    border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; padding: 4px 6px;
    flex-shrink: 0;
  }
  .smap-zoom button {
    font-family: inherit; font-size: 15px; font-weight: 700; line-height: 1;
    color: #334155; background: transparent; border: none; cursor: pointer;
    min-width: 34px; min-height: 34px; border-radius: 6px;
  }
  .smap-zoom button:hover { background: #f1f5f9; }
  .smap-zoom-value {
    font-size: 11px; font-weight: 700; color: #64748b;
    font-family: 'JetBrains Mono', monospace; min-width: 46px; text-align: center;
  }
  .smap-reset { font-size: 11.5px !important; padding: 0 10px; }

  .smap-frame {
    position: relative; width: 100%; overflow: hidden;
    /* Custom pan/pinch handling — the browser must not also scroll or zoom. */
    touch-action: none; -webkit-user-select: none; user-select: none;
    background: #f8fafc; border: 1px solid rgba(0,0,0,0.1); border-radius: 12px;
    cursor: grab;
  }
  .smap-frame:active { cursor: grabbing; }
  .smap-svg { display: block; width: 100%; height: 100%; }

  .smap-plot { cursor: pointer; }
  .smap-plot.is-dim { opacity: 0.28; }
  .smap-plot-number {
    text-anchor: middle; dominant-baseline: central;
    font-family: 'JetBrains Mono', monospace; font-weight: 600;
    pointer-events: none; user-select: none;
  }

  .smap-zone-label {
    text-anchor: middle; dominant-baseline: central;
    font-size: 9px; font-weight: 800; letter-spacing: 0.08em;
    text-transform: uppercase; pointer-events: none; user-select: none;
  }
  .smap-park-label {
    text-anchor: middle; dominant-baseline: central;
    font-size: 13px; font-weight: 800; pointer-events: none; user-select: none;
  }
  .smap-park-sub { font-size: 6.5px; font-weight: 700; letter-spacing: 0.14em; }
  .smap-road-label {
    text-anchor: middle; dominant-baseline: central;
    font-size: 6px; font-weight: 700; letter-spacing: 0.1em;
    fill: #6b6467; pointer-events: none; user-select: none;
  }

  .smap-tip {
    position: absolute; transform: translate(-50%, calc(-100% - 8px));
    background: #0f172a; color: #f8fafc; border-radius: 8px;
    padding: 8px 11px; pointer-events: none; z-index: 5;
    box-shadow: 0 6px 20px rgba(15,23,42,0.28); min-width: 118px;
  }
  .smap-tip-head { display: flex; align-items: baseline; gap: 7px; }
  .smap-tip-head strong { font-size: 15px; font-family: 'JetBrains Mono', monospace; }
  .smap-tip-block { font-size: 10.5px; font-weight: 600; color: #94a3b8; }
  .smap-tip-cat {
    display: flex; align-items: center; gap: 5px;
    font-size: 10.5px; font-weight: 600; color: #cbd5e1; margin-top: 4px;
  }
  .smap-tip-owner { font-size: 11.5px; font-weight: 600; margin-top: 5px; }
  .smap-tip-label { font-size: 11px; color: #a5b4c3; margin-top: 2px; }
  .smap-tip-warn { font-size: 10px; font-weight: 700; color: #fbbf24; margin-top: 5px; }

  .smap-hint { font-size: 11.5px; color: #94a3b8; margin: 8px 2px 0; line-height: 1.5; }
  .smap-hint-touch { display: none; }

  /* ── Touch / small screens ──
     Chips become thumb-sized, the legend scrolls sideways instead of stacking
     into a wall of pills, and the pinch hint replaces the scroll hint. */
  @media (hover: none) {
    .smap-hint-desktop { display: none; }
    .smap-hint-touch { display: inline; }
    .smap-legend-item { min-height: 40px; padding: 5px 13px 5px 9px; }
    .smap-zoom button { min-width: 40px; min-height: 40px; }
  }

  @media (max-width: 640px) {
    .smap-toolbar { flex-direction: column; align-items: stretch; gap: 8px; }
    .smap-legend {
      flex-wrap: nowrap; overflow-x: auto; padding-bottom: 2px;
      scrollbar-width: none; -ms-overflow-style: none;
    }
    .smap-legend::-webkit-scrollbar { display: none; }
    .smap-legend-item { flex-shrink: 0; }
    .smap-zoom { align-self: flex-start; }
    /* Under ~380px the full category names push the row too wide to skim. */
    @media (max-width: 380px) {
      .smap-legend-text { font-size: 10.5px; }
    }
  }
`;
