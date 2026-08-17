import { branch } from '../../lib/branch.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { search } from '../../lib/search/index.ts';
import type { PreparedIndex } from '../../lib/search/index.ts';
import type { Landmark } from '../../lib/landmarks/landmark-schema.ts';
import type { LandmarksState } from './landmarks-state.ts';

// Ranked by the fuzzy scorer, so the best name match leads; a hit whose landmark
// is gone from the payload is dropped.
const ranked = (
  all: readonly Landmark[],
  index: PreparedIndex,
  byId: ReadonlyMap<string, Landmark>,
  query: string,
): readonly Landmark[] =>
  search(index, query, all.length)
    .map((hit) => byId.get(hit.doc.id))
    .filter(isDefined);

/** The landmarks the grid shows: the search ranks them, the kind chips narrow
 *  them, and an untouched filter keeps the whole alphabetical list. */
export const visibleLandmarks = (
  all: readonly Landmark[],
  index: PreparedIndex,
  byId: ReadonlyMap<string, Landmark>,
  state: LandmarksState,
): readonly Landmark[] => {
  const base = branch(state.query.trim() === '')<readonly Landmark[]>(
    () => all,
    () => ranked(all, index, byId, state.query),
  );
  return branch(state.kinds.size === 0)<readonly Landmark[]>(
    () => base,
    () => base.filter((landmark) => state.kinds.has(landmark.kind)),
  );
};
