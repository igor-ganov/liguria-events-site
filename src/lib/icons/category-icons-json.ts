import { CATEGORIES } from '../events/categories.ts';
import { iconSvg } from './icon-svg.ts';

/** Category → inline SVG, shipped as one JSON island so the feed script can
 *  stamp icons on rows it renders itself. */
export const categoryIconsJson = (): string =>
  JSON.stringify(Object.fromEntries(CATEGORIES.map((c) => [c, iconSvg(c, 12)])));
