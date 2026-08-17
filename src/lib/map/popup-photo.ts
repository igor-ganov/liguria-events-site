import { branch } from '../branch.ts';
import { escapeAttr } from './escape-attr.ts';

/**
 * The framed photo at the top of a rich popup (landmarks and places). Unlike
 * the event thumbnail this one sits in its own `map-pop-thumb` span and is NOT
 * lazy: the caller warms the URL while the marker is on screen, so the card
 * must paint it the instant it opens. No image yields an empty string.
 */
export const popupPhoto = (image: string | undefined): string =>
  branch((image ?? '') === '')(
    () => '',
    () =>
      `<span class="map-pop-thumb"><img src="${escapeAttr(image ?? '')}" alt="" referrerpolicy="no-referrer" /></span>`,
  );
