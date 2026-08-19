// AUTO-COPIED from frontend-admin by scripts/sync-society-map.mjs — do not edit here.
/**
 * KKB4 Society Map — geometry + plot data, transcribed from the printed site plan
 * (`kkb4map.jpg`) and cross-validated against the block/plot-number ranges in
 * `backend/uploads/KKB4_Maintenance_Updated.xlsx`.
 *
 * ── How the plan is numbered ─────────────────────────────────────────────────
 * Plot numbers run as ONE continuous sequence over the whole scheme, spiralling
 * block by block. Each lettered block is a ring of plots wrapped around a central
 * park; the ring is walked in number order, and where a block's range ends the next
 * numbers are the Prime/Mortgage plots sitting in the gap before the next block.
 *
 *   L 1–7, 28–34 · [35–66 prime] · K 67–88 · [89–91] · J 92–112 · [113–118]
 *   I 119–141 · [142–147] · H 148–169 · [170–172] · G 173–193 · [194–199]
 *   F 199–221 · [222–224] · E 225–245 · [246–250] · D 251–273 · [274–279]
 *   C 280–302 · [303–344] · B 345–367 · [368–373] · A 374–396 · [397–460 mortgage]
 *
 * Gap plots take the letter of the block that FOLLOWS them — the maintenance sheet
 * lists plot 199 as "199 F", which is the gold Prime cell directly above F's ring.
 *
 * ── Category ≠ block ────────────────────────────────────────────────────────
 * The legend's five categories describe plot TYPE, not ownership grouping. A block
 * can contain Regular, Odd Size and Prime plots at once.
 *
 * Coordinates are abstract map units on a ~1200 × 730 canvas; the component scales
 * them with an SVG viewBox, so the drawing stays crisp at any zoom.
 *
 * ── This file is the source of truth ────────────────────────────────────────
 * `frontend-user/constants/societyMap.ts` is a generated copy and the backend's
 * `config/societyFacts.ts` is derived from this data. After editing, run:
 *
 *     node scripts/sync-society-map.mjs
 *
 * `--check` verifies the copies are current without writing anything.
 */

export type PlotCategory = 'mortgage' | 'prime' | 'odd' | 'amenity' | 'regular';

/** Colours sampled directly from the legend swatches on the photographed plan. */
export const CATEGORY_COLORS: Record<PlotCategory, string> = {
  mortgage: '#2a3739',
  prime: '#d4ae3e',
  odd: '#c2d1ad',
  amenity: '#542c33',
  regular: '#b0ced6',
};

export const CATEGORY_LABELS: Record<PlotCategory, string> = {
  mortgage: 'Mortgage Plots',
  prime: 'Prime Plots',
  odd: 'Odd Size Plots',
  amenity: 'Amenity Plots',
  regular: 'Regular Plots',
};

/** Legend order as printed on the plan (top to bottom). */
export const CATEGORY_ORDER: PlotCategory[] = ['mortgage', 'prime', 'odd', 'amenity', 'regular'];

export const PARK_COLOR = '#12633c';
export const GROUND_COLOR = '#cdbfc0';
export const ROAD_COLOR = '#e4dcdc';

export interface PlotShape {
  /** Stable key — `${number}-${block}`, matching the sheet's "374 A" convention. */
  id: string;
  number: number;
  block: string;
  category: PlotCategory;
  x: number;
  y: number;
  w: number;
  h: number;
  /** True when the printed number could not be read and was derived from sequence. */
  uncertain?: boolean;
}

export interface ZoneShape {
  id: string;
  label: string;
  kind: 'amenity' | 'park';
  x: number;
  y: number;
  w: number;
  h: number;
  /** Render the label rotated 90° (narrow vertical zones). */
  vertical?: boolean;
}

export interface RoadLabel {
  text: string;
  x: number;
  y: number;
  vertical?: boolean;
}

/* ─── run(): emit a straight run of plots ─────────────────────────────────────
   `cells` is walked in number order. Direction 'r'/'l' walks a horizontal row,
   'd'/'u' walks a vertical column. A cell is either a plain number (taking the
   run's default category) or a [number, category] pair. */

type Cell = number | [number, PlotCategory];

interface RunOpts {
  block: string;
  x: number;
  y: number;
  cw: number;
  ch: number;
  dir: 'r' | 'l' | 'd' | 'u';
  cells: Cell[];
  cat?: PlotCategory;
  uncertain?: boolean;
}

function run({ block, x, y, cw, ch, dir, cells, cat = 'regular', uncertain }: RunOpts): PlotShape[] {
  return cells.map((cell, i) => {
    const number = Array.isArray(cell) ? cell[0] : cell;
    const category = Array.isArray(cell) ? cell[1] : cat;
    const px = dir === 'r' ? x + i * cw : dir === 'l' ? x - i * cw : x;
    const py = dir === 'd' ? y + i * ch : dir === 'u' ? y - i * ch : y;
    return {
      id: `${number}-${block}`,
      number,
      block,
      category,
      x: px,
      y: py,
      w: cw,
      h: ch,
      ...(uncertain ? { uncertain: true } : {}),
    };
  });
}

/** Inclusive integer range helper. */
const seq = (from: number, to: number): number[] =>
  from <= to
    ? Array.from({ length: to - from + 1 }, (_, i) => from + i)
    : Array.from({ length: from - to + 1 }, (_, i) => from - i);


/* ═══════════════════════════════════════════════════════════════════════════
   LAYOUT

   Everything sits on ONE shared column grid of width `G`, indexed by grid column
   `g`. Both residential bands use it, which is what makes them line up
   north–south the way they do on the printed plan: A over K, B over J, the
   civic core over I, C over F, D over E.

   Each lettered block occupies exactly 7 grid columns — its left column of plots
   at `g`, its right column at `g + 6` — so a block is a ring 7 frontages wide
   wrapped around its park.
   ═══════════════════════════════════════════════════════════════════════════ */

const G = 23;
/** x of grid column `g`. */
const gx = (g: number) => g * G;

/* Band 1 — northern phase (A, B, civic core, C, D) */
const B1_STRIP = 0;      // outer Mortgage strip along the boundary road
const B1_ROW = 26;       // continuous plot row facing that road
const B1_COL = 52;       // vertical columns
const B1_COL_H = 138;
const B1_BOT = 190;      // block bottom rows
const B1_BOT2 = 216;     // outer Prime / Mortgage bottom rows
const B1_END = 242;
const D1 = 26;           // row depth in band 1

/* Band 2 — central phase (K, J, I, H, G, F, E) */
const B2_PRIME = 268;    // Prime strip along the top of the band
const B2_ROW = 292;      // block top rows
const B2_COL = 316;
const B2_COL_H = 132;
const B2_BOT = 448;
const B2_BOT2 = 472;
const B2_END = 496;
const D2 = 24;

/* Band 3 — southern phase (L, graveyard) */
const B3_TOP = 522;
const B3_H = 126;
const B3_END = 648;

const TOTAL_W = gx(50);

/** Column cell height so `n` cells fill a column band exactly. */
const c1 = (n: number) => B1_COL_H / n;
const c2 = (n: number) => B2_COL_H / n;
/** Row cell width so `n` cells span `gspan` grid columns exactly. */
const rw = (n: number, gspan: number) => (gspan * G) / n;

/* ─── Band 1 ─────────────────────────────────────────────────────────────── */

const band1: PlotShape[] = [
  // Outer Mortgage ring: along the top, down the west side, back along the south.
  run({ block: 'A', x: gx(0), y: B1_STRIP, cw: G, ch: D1, dir: 'r', cells: seq(412, 436), cat: 'mortgage' }),
  run({ block: 'A', x: gx(26), y: B1_STRIP, cw: G, ch: D1, dir: 'r', cells: seq(437, 460), cat: 'mortgage' }),
  run({ block: 'A', x: gx(0), y: B1_COL, cw: G, ch: c1(9), dir: 'd', cells: seq(411, 403), cat: 'mortgage' }),
  run({ block: 'A', x: gx(0), y: B1_BOT2, cw: G, ch: D1, dir: 'r', cells: seq(402, 397), cat: 'mortgage' }),

  // The row facing the boundary road runs continuously across block boundaries.
  run({ block: 'A', x: gx(1), y: B1_ROW, cw: G, ch: D1, dir: 'r',
        cells: [[387, 'odd'], 386, 385, 384, 383, 382, [381, 'odd']] }),
  run({ block: 'B', x: gx(8), y: B1_ROW, cw: G, ch: D1, dir: 'r',
        cells: [[358, 'odd'], 357, 356, 355, 354, 353, [352, 'odd'], [335, 'odd']] }),
  run({ block: 'B', x: gx(16), y: B1_ROW, cw: G, ch: D1, dir: 'r', cells: seq(334, 326), cat: 'prime' }),
  run({ block: 'B', x: gx(26), y: B1_ROW, cw: G, ch: D1, dir: 'r', cells: seq(325, 316), cat: 'prime' }),
  run({ block: 'C', x: gx(36), y: B1_ROW, cw: G, ch: D1, dir: 'r',
        cells: [[293, 'odd'], 292, 291, 290, 289, 288, [287, 'odd']] }),
  run({ block: 'D', x: gx(43), y: B1_ROW, cw: G, ch: D1, dir: 'r',
        cells: [[264, 'odd'], 263, 262, 261, 260, 259, [258, 'odd']] }),

  // Block A — 374–396
  run({ block: 'A', x: gx(1), y: B1_COL, cw: G, ch: c1(5), dir: 'd', cells: seq(388, 392) }),
  run({ block: 'A', x: gx(1), y: B1_BOT, cw: G, ch: D1, dir: 'r', cells: [[393, 'odd'], 394, 395, [396, 'odd']] }),
  run({ block: 'A', x: gx(7), y: B1_COL, cw: G, ch: c1(7), dir: 'd', cells: seq(380, 374) }),
  run({ block: 'A', x: gx(7), y: B1_BOT2, cw: G, ch: D1, dir: 'r', cells: seq(373, 368), cat: 'prime' }),

  // Block B — 345–367, plus the Prime apron wrapping the civic core
  run({ block: 'B', x: gx(8), y: B1_COL, cw: G, ch: c1(5), dir: 'd', cells: seq(359, 363) }),
  run({ block: 'B', x: gx(8), y: B1_BOT, cw: G, ch: D1, dir: 'r', cells: [[364, 'odd'], 365, 366, [367, 'odd']] }),
  run({ block: 'B', x: gx(14), y: B1_COL, cw: G, ch: c1(7), dir: 'd', cells: seq(351, 345) }),
  run({ block: 'B', x: gx(15), y: B1_COL, cw: G, ch: c1(7), dir: 'd', cells: seq(336, 342), cat: 'prime' }),
  run({ block: 'B', x: gx(14), y: B1_BOT, cw: G, ch: D1, dir: 'r', cells: [344, 343], cat: 'prime' }),

  // Block C — 280–302, with its Prime apron on the west and south
  run({ block: 'B', x: gx(35), y: B1_COL, cw: G, ch: c1(7), dir: 'd', cells: seq(315, 309), cat: 'prime' }),
  run({ block: 'C', x: gx(36), y: B1_COL, cw: G, ch: c1(6), dir: 'd',
        cells: [294, 295, 296, 297, 298, [299, 'odd']] }),
  run({ block: 'C', x: gx(36), y: B1_BOT, cw: G, ch: D1, dir: 'r', cells: [300, 301, [302, 'odd']] }),
  run({ block: 'B', x: gx(35), y: B1_BOT2, cw: G, ch: D1, dir: 'r', cells: seq(308, 303), cat: 'prime' }),
  run({ block: 'C', x: gx(42), y: B1_COL, cw: G, ch: c1(7), dir: 'd', cells: seq(286, 280) }),

  // Block D — 251–273
  run({ block: 'D', x: gx(43), y: B1_COL, cw: G, ch: c1(6), dir: 'd',
        cells: [265, 266, 267, 268, 269, [270, 'odd']] }),
  run({ block: 'D', x: gx(43), y: B1_BOT, cw: G, ch: D1, dir: 'r', cells: [271, 272, [273, 'odd']] }),
  run({ block: 'C', x: gx(43), y: B1_BOT2, cw: G, ch: D1, dir: 'r', cells: seq(279, 274), cat: 'prime' }),
  run({ block: 'D', x: gx(49), y: B1_COL, cw: G, ch: c1(7), dir: 'd', cells: seq(257, 251) }),
  run({ block: 'D', x: gx(49), y: B1_BOT2, cw: G, ch: D1, dir: 'r', cells: [250], cat: 'prime' }),
].flat();

/* ─── Band 2 ─────────────────────────────────────────────────────────────── */

const band2: PlotShape[] = [
  // Prime apron down the west edge and along the south — DERIVED numbers: the
  // photograph is creased here and the printed digits cannot be resolved. Cell
  // counts were measured off the printed grid.
  run({ block: 'K', x: gx(0), y: B2_ROW, cw: G, ch: (B2_BOT2 - B2_ROW) / 12, dir: 'd',
        cells: seq(66, 55), cat: 'prime', uncertain: true }),
  run({ block: 'K', x: gx(1), y: B2_BOT2, cw: G, ch: D2, dir: 'r',
        cells: seq(54, 35), cat: 'prime', uncertain: true }),

  // Block K — 67–88 (numbers derived from the sheet's range and the ring order)
  run({ block: 'K', x: gx(1), y: B2_COL, cw: G, ch: c2(7), dir: 'd', cells: seq(67, 73), uncertain: true }),
  run({ block: 'K', x: gx(1), y: B2_BOT, cw: G, ch: D2, dir: 'r',
        cells: [74, 75, 76, 77, 78, 79, [80, 'odd']], uncertain: true }),
  run({ block: 'K', x: gx(7), y: B2_COL, cw: G, ch: c2(4), dir: 'd', cells: seq(84, 81), uncertain: true }),
  run({ block: 'K', x: gx(1), y: B2_ROW, cw: rw(4, 7), ch: D2, dir: 'r', cells: seq(88, 85), uncertain: true }),

  run({ block: 'J', x: gx(8), y: B2_PRIME, cw: G, ch: D2, dir: 'r', cells: [89, 90, 91], cat: 'prime', uncertain: true }),

  // Block J — 92–112
  run({ block: 'J', x: gx(8), y: B2_COL, cw: G, ch: c2(5), dir: 'd', cells: seq(92, 96) }),
  run({ block: 'J', x: gx(8), y: B2_BOT, cw: G, ch: D2, dir: 'r',
        cells: [[97, 'odd'], 98, 99, 100, 101, 102, [103, 'odd']] }),
  run({ block: 'J', x: gx(14), y: B2_COL, cw: G, ch: c2(5), dir: 'd', cells: seq(108, 104) }),
  run({ block: 'J', x: gx(8), y: B2_ROW, cw: rw(4, 7), ch: D2, dir: 'r',
        cells: [[112, 'odd'], 111, 110, [109, 'odd']] }),

  run({ block: 'I', x: gx(14), y: B2_PRIME, cw: G, ch: D2, dir: 'r', cells: seq(113, 118), cat: 'prime' }),

  // Block I — 119–141
  run({ block: 'I', x: gx(15), y: B2_COL, cw: G, ch: c2(7), dir: 'd', cells: seq(119, 125) }),
  run({ block: 'I', x: gx(15), y: B2_BOT, cw: G, ch: D2, dir: 'r',
        cells: [[126, 'odd'], 127, 128, 129, 130, 131, [132, 'odd']] }),
  run({ block: 'I', x: gx(21), y: B2_COL, cw: G, ch: c2(5), dir: 'd', cells: seq(137, 133) }),
  run({ block: 'I', x: gx(15), y: B2_ROW, cw: rw(4, 7), ch: D2, dir: 'r',
        cells: [[141, 'odd'], 140, 139, [138, 'odd']] }),

  run({ block: 'H', x: gx(20), y: B2_PRIME, cw: G, ch: D2, dir: 'r', cells: seq(142, 147), cat: 'prime' }),

  // Block H — 148–169
  run({ block: 'H', x: gx(22), y: B2_COL, cw: G, ch: c2(7), dir: 'd', cells: seq(148, 154) }),
  run({ block: 'H', x: gx(22), y: B2_BOT, cw: G, ch: D2, dir: 'r',
        cells: [[155, 'odd'], 156, 157, 158, 159, 160, [161, 'odd']] }),
  run({ block: 'H', x: gx(28), y: B2_COL, cw: G, ch: c2(5), dir: 'd', cells: seq(166, 162) }),
  run({ block: 'H', x: gx(25), y: B2_ROW, cw: G, ch: D2, dir: 'r', cells: [[169, 'odd'], 168, 167] }),

  run({ block: 'G', x: gx(26), y: B2_PRIME, cw: G, ch: D2, dir: 'r', cells: [170, 171, 172], cat: 'prime' }),

  // Block G — 173–193
  run({ block: 'G', x: gx(29), y: B2_COL, cw: G, ch: c2(7), dir: 'd', cells: seq(173, 179) }),
  run({ block: 'G', x: gx(29), y: B2_BOT, cw: rw(5, 7), ch: D2, dir: 'r',
        cells: [180, 181, 182, 183, [184, 'odd']] }),
  run({ block: 'G', x: gx(35), y: B2_COL, cw: G, ch: c2(6), dir: 'd',
        cells: [[190, 'odd'], 189, 188, 187, 186, 185] }),
  run({ block: 'G', x: gx(32), y: B2_ROW, cw: G, ch: D2, dir: 'r', cells: [[193, 'odd'], 192, 191] }),

  // 199 is the gold cell directly above F's ring — the sheet lists it as "199 F".
  run({ block: 'F', x: gx(31), y: B2_PRIME, cw: G, ch: D2, dir: 'r', cells: seq(194, 199), cat: 'prime' }),

  // Block F — 200–221
  run({ block: 'F', x: gx(36), y: B2_COL, cw: G, ch: c2(7), dir: 'd', cells: seq(200, 206) }),
  run({ block: 'F', x: gx(36), y: B2_BOT, cw: G, ch: D2, dir: 'r',
        cells: [[207, 'odd'], 208, 209, 210, 211, 212, [213, 'odd']] }),
  run({ block: 'F', x: gx(42), y: B2_COL, cw: G, ch: c2(5), dir: 'd',
        cells: [[218, 'odd'], 217, 216, 215, 214] }),
  run({ block: 'F', x: gx(39), y: B2_ROW, cw: G, ch: D2, dir: 'r', cells: [[221, 'odd'], 220, 219] }),

  run({ block: 'E', x: gx(39), y: B2_PRIME, cw: G, ch: D2, dir: 'r', cells: [222, 223, 224], cat: 'prime' }),

  // Block E — 225–245
  run({ block: 'E', x: gx(43), y: B2_COL, cw: G, ch: c2(5), dir: 'd', cells: seq(225, 229) }),
  run({ block: 'E', x: gx(43), y: B2_BOT, cw: G, ch: D2, dir: 'r',
        cells: [[230, 'odd'], 231, 232, 233, 234, 235, [236, 'odd']] }),
  run({ block: 'E', x: gx(49), y: B2_COL, cw: G, ch: c2(5), dir: 'd', cells: seq(241, 237) }),
  run({ block: 'E', x: gx(44), y: B2_ROW, cw: rw(4, 6), ch: D2, dir: 'r',
        cells: [[245, 'odd'], 244, 243, [242, 'odd']] }),

  // 246–249 north of E; 250 sits under D's ring, up in band 1.
  run({ block: 'D', x: gx(44), y: B2_PRIME, cw: G, ch: D2, dir: 'r', cells: seq(246, 249), cat: 'prime' }),
].flat();

/* ─── Band 3 ─────────────────────────────────────────────────────────────── */

// Plots 8–27 do not exist. Two independent drawings agree: the printed colour
// plan and the AutoCAD layout both show L as exactly two columns of 7 either side
// of its park, with empty land to the west. The maintenance register's entries for
// L-10 and L-27 are therefore the suspect side of that mismatch.
const band3: PlotShape[] = [
  run({ block: 'L', x: gx(13), y: B3_TOP, cw: G, ch: B3_H / 7, dir: 'd', cells: seq(1, 7) }),
  run({ block: 'L', x: gx(19), y: B3_TOP, cw: G, ch: B3_H / 7, dir: 'd', cells: seq(34, 28) }),
].flat();

export const PLOTS: PlotShape[] = [...band1, ...band2, ...band3];

/* ─── Non-residential zones ──────────────────────────────────────────────── */

/** A block's park fills the middle of its 7-column ring. */
const park = (label: string, g: number, y: number, h: number): ZoneShape => ({
  id: `park-${label}`,
  label,
  kind: 'park',
  x: gx(g + 1) + 3,
  y: y + 8,
  w: G * 5 - 6,
  h: h - 16,
});

export const ZONES: ZoneShape[] = [
  // Civic core — sits above block I / H, as on the plan
  { id: 'services', label: 'Services Area', kind: 'amenity', x: gx(16), y: B1_COL, w: G * 9, h: 62 },
  { id: 'central-park', label: 'Central Park', kind: 'park', x: gx(16), y: B1_COL + 74, w: G * 9, h: 64 },
  { id: 'school', label: 'School', kind: 'amenity', x: gx(26), y: B1_COL, w: G * 9, h: 62 },
  { id: 'mall', label: 'Shopping Mall', kind: 'amenity', x: gx(26), y: B1_COL + 74, w: G * 9, h: 64 },

  park('A', 1, B1_COL, B1_COL_H),
  park('B', 8, B1_COL, B1_COL_H),
  park('C', 36, B1_COL, B1_COL_H),
  park('D', 43, B1_COL, B1_COL_H),

  { id: 'mosque', label: 'Mosque', kind: 'amenity', x: gx(29), y: B2_PRIME, w: G * 2, h: B2_COL - B2_PRIME },
  { id: 'community', label: 'Community Centre', kind: 'amenity', x: gx(42), y: B2_PRIME, w: G * 2, h: B2_COL - B2_PRIME },
  { id: 'office', label: 'Office', kind: 'amenity', x: gx(0), y: B2_BOT2, w: G, h: D2, vertical: true },

  park('K', 1, B2_COL, B2_COL_H),
  park('J', 8, B2_COL, B2_COL_H),
  park('I', 15, B2_COL, B2_COL_H),
  park('H', 22, B2_COL, B2_COL_H),
  park('G', 29, B2_COL, B2_COL_H),
  park('F', 36, B2_COL, B2_COL_H),
  park('E', 43, B2_COL, B2_COL_H),

  park('L', 13, B3_TOP, B3_H),
  { id: 'graveyard', label: 'Graveyard', kind: 'amenity', x: gx(13), y: B3_END + 6, w: G * 7, h: 56 },
];

/** Road strips drawn under the plots so the street pattern reads at a glance. */
export const ROADS: { x: number; y: number; w: number; h: number }[] = [
  { x: 0, y: B1_END, w: TOTAL_W, h: B2_PRIME - B1_END },
  { x: 0, y: B2_END, w: TOTAL_W, h: B3_TOP - B2_END },
  { x: gx(25), y: 0, w: G, h: B1_END },
  { x: gx(21), y: B2_PRIME, w: G, h: B2_END - B2_PRIME },
  { x: gx(14), y: B3_TOP, w: G * 5, h: B3_H },
  { x: gx(7), y: B1_COL, w: 6, h: B1_COL_H },
  { x: gx(42), y: B1_COL, w: 6, h: B1_COL_H },
];

export const ROAD_LABELS: RoadLabel[] = [
  { text: "ROAD 40' WIDE", x: gx(33), y: B1_END + 13 },
  { text: "ROAD 40' WIDE", x: gx(33), y: B2_END + 13 },
  { text: "ROAD 30' WIDE", x: gx(25) + 12, y: 130, vertical: true },
  { text: "ROAD 30' WIDE", x: gx(21) + 12, y: 382, vertical: true },
  { text: "ROAD 30' WIDE", x: gx(16) + 6, y: 585, vertical: true },
];

export const MAP_VIEWBOX = { x: -14, y: -14, w: TOTAL_W + 28, h: B3_END + 90 };

/* ─── Derived indexes ───────────────────────────────────────────────────────── */

export const BLOCK_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

/** Every plot whose printed number could not be read off the photograph. */
export const UNCERTAIN_PLOTS = PLOTS.filter((p) => p.uncertain).map((p) => p.id);

/** Plot numbers the sequence implies but that the printed plan never shows. */
export const MISSING_FROM_PLAN = seq(8, 27);
