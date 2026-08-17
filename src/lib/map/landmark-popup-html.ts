import { richPopupHtml } from './rich-popup-html.ts';
import type { RichPopup } from './rich-popup-html.ts';

/** A landmark card is the rich card without the extra facts block. */
export type LandmarkPopup = Omit<RichPopup, 'facts'>;

/**
 * The card a landmark marker opens: photo, heritage-kind badge, name, blurb and
 * the sources it was built from (Wikipedia, Wikidata, OpenStreetMap).
 */
export const landmarkPopupHtml = (popup: LandmarkPopup): string =>
  richPopupHtml({ ...popup, facts: '' });
