const PIN =
  'M16 1.6C8.6 1.6 2.6 7.5 2.6 14.9 2.6 24.4 16 38.4 16 38.4S29.4 24.4 29.4 14.9C29.4 7.5 23.4 1.6 16 1.6Z';
const WAVE = 'M8.2 16.4C10.7 12.7 13.6 12.7 16 16.4 18.4 20.1 21.3 20.1 23.8 16.4';

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
