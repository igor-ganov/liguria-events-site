import { UI_ICON_PATHS } from './ui-icon-paths.ts';
import type { UiIconName } from './ui-icon-paths.ts';

/** Full inline `<svg>` string for a chrome/UI icon — same feather style as
 *  iconSvg. Astro injects via set:html; client code via innerHTML. A size of
 *  `'1em'` makes the icon follow the text it sits in, which is what an icon
 *  standing in for a glyph wants. Always decorative (`aria-hidden`): the
 *  control or the text beside it carries the name. */
export const uiIcon = (name: UiIconName, size: number | '1em' = 16): string =>
  `<svg class="ui-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
  `stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ` +
  `aria-hidden="true" focusable="false">${UI_ICON_PATHS[name]}</svg>`;
