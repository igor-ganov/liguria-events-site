import type { Category } from '../events/categories.ts';
import { ICON_PATHS } from './icon-paths.ts';

/** Full inline `<svg>` string for a category — Astro pages inject via set:html. */
export const iconSvg = (category: Category, size = 16): string =>
  `<svg class="cat-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
  `stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ` +
  `aria-hidden="true">${ICON_PATHS[category]}</svg>`;
