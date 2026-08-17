import { placeFactsHtml } from './place-facts-html.ts';
import type { PlaceFacts } from './place-facts-html.ts';
import { richPopupHtml } from './rich-popup-html.ts';
import type { RichPopup } from './rich-popup-html.ts';

/** A place card is the rich card whose facts block is built from hours + phone. */
export type PlacePopup = Readonly<Omit<RichPopup, 'facts'> & { facts: PlaceFacts }>;

/**
 * The card a place marker opens: photo (rare — most places have only the
 * category icon), category badge, name, blurb, the hours/phone facts and a
 * teaser of the source chips.
 */
export const placePopupHtml = ({ facts, ...rest }: PlacePopup): string =>
  richPopupHtml({ ...rest, facts: placeFactsHtml(facts) });
