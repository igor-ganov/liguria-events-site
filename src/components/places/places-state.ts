import type { PlaceCategory } from '../../lib/places/place-categories.ts';

/** What the grid is filtered by right now. */
export type PlacesState = {
  readonly cats: Set<PlaceCategory>;
  query: string;
};

/** Module-level, so the chosen categories and the typed query survive an SPA
 *  swap. */
export const placesState: PlacesState = { cats: new Set<PlaceCategory>(), query: '' };
