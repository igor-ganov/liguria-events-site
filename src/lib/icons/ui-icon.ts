import { UI_ICON_PATHS } from './ui-icon-paths.ts';
import type { UiIconName } from './ui-icon-paths.ts';

/** Full inline `<svg>` string for a chrome/UI icon — same feather style as
 *  iconSvg. Astro injects via set:html; client code via innerHTML. */
export const uiIcon = (name: UiIconName, size = 16): string =>
  `<svg class="ui-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
  `stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ` +
  `aria-hidden="true">${UI_ICON_PATHS[name]}</svg>`;
