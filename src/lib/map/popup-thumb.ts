import { branch } from '../branch.ts';
import { escapeAttr } from './escape-attr.ts';

/**
 * The popup's thumbnail markup for an item that may carry no image — an absent
 * image yields an empty string rather than a broken <img>. Lazy + no-referrer
 * matches how thumbnails are loaded everywhere else on the map.
 */
export const popupThumb = (image: string | undefined): string =>
  branch(image === undefined)(
    () => '',
    () =>
      `<img src="${escapeAttr(image ?? '')}" alt="" loading="lazy" referrerpolicy="no-referrer" />`,
  );
