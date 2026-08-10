/**
 * Script/direction detection for user-entered text.
 *
 * Residents write complaints in Urdu, English, or a mix ("plot 262 D میں پانی کا
 * مسئلہ"). Text stored in one field therefore needs its direction decided per
 * value at render time.
 *
 * Why not just `dir="auto"`: the browser's built-in algorithm looks only at the
 * FIRST strong directional character, so a mostly-Urdu complaint that happens to
 * open with a plot number or an English word lays out left-to-right. Comparing
 * how much of each script is present matches what the writer intended.
 */

/**
 * Arabic-script ranges covering Urdu: Arabic, Arabic Supplement, Extended-A,
 * and the presentation forms (stopping at U+FEFC so a pasted BOM, U+FEFF,
 * is not mistaken for Urdu content).
 */
const RTL_SCRIPT = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-ﻼ]/g;
/** Latin letters only — digits and punctuation are direction-neutral. */
const LATIN_LETTERS = /[A-Za-z]/g;

export type TextDirection = 'rtl' | 'ltr';

/** True when the text contains any Urdu/Arabic-script character. */
export function containsUrdu(text?: string | null): boolean {
  if (!text) return false;
  RTL_SCRIPT.lastIndex = 0;
  return RTL_SCRIPT.test(text);
}

/**
 * Decide a direction by comparing script volume. Ties and empty input fall back
 * to `ltr`, matching the rest of the admin UI.
 */
export function detectTextDirection(text?: string | null): TextDirection {
  if (!text) return 'ltr';
  const rtlCount = (text.match(RTL_SCRIPT) || []).length;
  if (rtlCount === 0) return 'ltr';
  const latinCount = (text.match(LATIN_LETTERS) || []).length;
  return rtlCount >= latinCount ? 'rtl' : 'ltr';
}

/**
 * Props to spread onto an element rendering user text. `textAlign: start`
 * follows whichever direction was chosen, and the app's global
 * `[dir="rtl"]` rule supplies the Nastaliq Urdu font.
 */
export function textDirectionProps(text?: string | null): {
  dir: TextDirection;
  style: { textAlign: 'start'; lineHeight?: number };
} {
  const dir = detectTextDirection(text);
  return {
    dir,
    // Nastaliq has tall ascenders/descenders and needs more leading than Latin.
    style: dir === 'rtl' ? { textAlign: 'start', lineHeight: 2 } : { textAlign: 'start' },
  };
}
