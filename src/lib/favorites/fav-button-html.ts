import { HEART } from './heart.ts';
import { isDefined } from '../is-defined.ts';
import type { FavPoi } from './fav-pois.ts';

const esc = (s: string): string => s.replace(/[<>&"]/g, (c) => `&#${c.charCodeAt(0)};`);

// A 0-or-1 array: a card without a POI emits no attribute at all.
const poiAttr = (poi: FavPoi | undefined): string =>
  [poi]
    .filter(isDefined)
    .map((p) => `data-fav-poi="${esc(JSON.stringify(p))}" `)
    .at(0) ?? '';

/** A compact heart toggle for a card corner. `label` is the accessible name.
 *  For a landmark/place, pass `poi` so the toggle can stash what it needs to
 *  render the favourite later (a POI id doesn't encode its region). */
export const favButtonHtml = (id: string, label: string, poi?: FavPoi): string =>
  `<button type="button" class="fav-btn" data-fav-toggle data-fav-id="${esc(id)}" aria-pressed="false" ` +
  poiAttr(poi) +
  `aria-label="${esc(label)}" title="${esc(label)}">${HEART}</button>`;
