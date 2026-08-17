import { branch } from '../../lib/branch.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { search } from '../../lib/search/index.ts';
import type { PreparedIndex } from '../../lib/search/index.ts';
import type { Place } from '../../lib/places/place-schema.ts';
import type { PlacesState } from './places-state.ts';

// Ranked by the fuzzy scorer, so the best name match leads; a hit whose place is
// gone from the payload is dropped.
const ranked = (
  all: readonly Place[],
  index: PreparedIndex,
  byId: ReadonlyMap<string, Place>,
  query: string,
): readonly Place[] =>
  search(index, query, all.length)
    .map((hit) => byId.get(hit.doc.id))
    .filter(isDefined);

/** The places the grid shows: the search ranks them, the category chips narrow
 *  them, and an untouched filter keeps the whole alphabetical list. */
export const visiblePlaces = (
  all: readonly Place[],
  index: PreparedIndex,
  byId: ReadonlyMap<string, Place>,
  state: PlacesState,
): readonly Place[] => {
  const base = branch(state.query.trim() === '')<readonly Place[]>(
    () => all,
    () => ranked(all, index, byId, state.query),
  );
  return branch(state.cats.size === 0)<readonly Place[]>(
    () => base,
    () => base.filter((place) => state.cats.has(place.cat)),
  );
};
