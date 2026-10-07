import { CATEGORIES } from '../events/categories.ts';
import { HEART_PATH } from '../favorites/heart-path.ts';
import { ICON_PATHS } from './icon-paths.ts';
import { UI_ICON_PATHS } from './ui-icon-paths.ts';

const symbol = ([name, paths]: readonly [string, string]): string => `<symbol id="ic-${name}" viewBox="0 0 24 24">${paths}</symbol>`;

const glyphs = (): readonly (readonly [string, string])[] => [
  ...CATEGORIES.map((category): readonly [string, string] => [category, ICON_PATHS[category]]),
  ['pin', UI_ICON_PATHS.pin],
  ['heart', HEART_PATH],
];

/**
 * Every glyph a feed card can show, drawn once: a symbol per category, the pin
 * and the heart. A feed page carries this ahead of its cards, and each card
 * points at what it needs (see spriteUse) — several hundred cards used to
 * repeat these drawings two thousand times over.
 */
export const feedSprite = (): string =>
  '<svg class="icon-sprite" width="0" height="0" aria-hidden="true">' +
  glyphs()
    .map(symbol)
    .join('') +
  '</svg>';
