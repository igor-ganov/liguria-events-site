import type { PlaceCategory } from './place-categories.ts';
import { PLACE_ICON_PATHS } from './place-icon-paths.ts';

/** Inner SVG markup for a category, falling back to the restaurant glyph so an
 *  unknown category still renders a marker rather than an empty <svg>. */
export const placeIconPath = (cat: PlaceCategory): string =>
  PLACE_ICON_PATHS[cat] ?? PLACE_ICON_PATHS.restaurant;
