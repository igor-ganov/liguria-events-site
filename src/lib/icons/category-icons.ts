import { CATEGORIES } from '../events/categories.ts';
import { iconSvg } from './icon-svg.ts';

/** Category → inline SVG at chip size: what a feed card needs to draw its
 *  chips. The server calls it directly; the browser gets the same map in JSON. */
export const categoryIcons = (): Readonly<Record<string, string>> =>
  Object.fromEntries(CATEGORIES.map((category) => [category, iconSvg(category, 12)]));
