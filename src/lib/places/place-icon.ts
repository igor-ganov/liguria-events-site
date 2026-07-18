import { placeIconPath } from './place-icon-paths.ts';
import type { PlaceCategory } from './place-categories.ts';

/** Full inline `<svg>` string for a place category — matches iconSvg's feather
 *  style. Consumed by cards, chips, map markers/popups and the detail page. */
export const placeIcon = (cat: PlaceCategory, size = 16): string =>
  `<svg class="pl-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
  `stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ` +
  `aria-hidden="true">${placeIconPath(cat)}</svg>`;
