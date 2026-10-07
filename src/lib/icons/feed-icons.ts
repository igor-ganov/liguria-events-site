import { CATEGORIES } from '../events/categories.ts';
import { spriteUse } from './sprite-use.ts';

/** Category → its chip glyph, by reference into the feed sprite. What a feed
 *  card is built with, on the server and — sent as JSON — in the browser. */
export const feedIcons = (): Readonly<Record<string, string>> =>
  Object.fromEntries(CATEGORIES.map((category) => [category, spriteUse(category, 12, 'cat-icon sprite-icon')]));
