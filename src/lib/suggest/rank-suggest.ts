import { topMatches } from './top-matches.ts';
import type { SemanticIds } from './suggest-doc.ts';
import type { Match, VectorIndex } from './vector-index.ts';

// bge-m3 puts unrelated short texts around 0.3–0.45 and related ones above
// 0.5. FLOOR drops what is near nothing at all; SPREAD keeps only what is about
// as close as the best answer, so a precise query is not padded with noise.
// Both are a first calibration and live here, in one place, to be tuned
// against what readers type.
const FLOOR = 0.45;
const SPREAD = 0.12;

const VENUE = 'venue:';

const closeEnough = (found: readonly Match[]): readonly string[] =>
  found.filter((one) => one.score >= Math.max(FLOOR, (found[0]?.score ?? 0) - SPREAD)).map((one) => one.id);

/** Upcoming events and venues of one region nearest a query in meaning, each
 *  kind ranked and cut on its own: a venue is described by everything it
 *  hosts, so its scores sit on a different level from a single event's. */
export const rankSuggest = (index: VectorIndex, query: readonly number[], region: string, today: string): SemanticIds => {
  const inRegion = (row: number): boolean => index.regions[row] === region;
  const isVenue = (row: number): boolean => (index.ids[row] ?? '').startsWith(VENUE);
  const upcoming = (row: number): boolean => (index.until[row] ?? '') >= today;
  return {
    events: closeEnough(topMatches(index, query, (row) => inRegion(row) && !isVenue(row) && upcoming(row), 8)),
    venues: closeEnough(topMatches(index, query, (row) => inRegion(row) && isVenue(row), 5)),
  };
};
