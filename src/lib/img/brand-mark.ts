import { BRAND_PATHS } from './brand-paths.ts';

const PIN = BRAND_PATHS.pin;
const WAVE = BRAND_PATHS.wave;

/**
 * The mark of the site — the pin with the wave in it — as inline SVG.
 *
 * It stands where a photograph would be when an event has none. A drawing of
 * our own says "no picture came with this"; a glyph picked by category said
 * something about the event that nobody had checked, and looked chosen at
 * random beside real photographs.
 */
export const BRAND_MARK =
  '<svg class="brand-mark" viewBox="0 0 32 40" fill="none" aria-hidden="true">' +
  `<path d="${PIN}" fill="currentColor"/>` +
  `<path d="${WAVE}" stroke="var(--brand-mark-wave, #16181c)" stroke-width="2.6" stroke-linecap="round"/></svg>`;
