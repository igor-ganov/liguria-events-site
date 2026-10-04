import { categoryIcons } from './category-icons.ts';

/** Category → inline SVG, shipped as one JSON island so the feed script can
 *  stamp icons on rows it renders itself. */
export const categoryIconsJson = (): string => JSON.stringify(categoryIcons());
