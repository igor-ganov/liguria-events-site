import { LANDMARK_ICON_PATHS } from './landmark-icon-paths.ts';
import type { LandmarkKind } from './landmark-kinds.ts';

/** Full inline `<svg>` string for a landmark kind — matches iconSvg's feather
 *  style. Consumed by cards, chips, map popups/markers and the detail page. */
export const landmarkIcon = (kind: LandmarkKind, size = 16): string =>
  `<svg class="lm-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
  `stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ` +
  `aria-hidden="true">${LANDMARK_ICON_PATHS[kind]}</svg>`;
