import { legKey } from './leg-key.ts';
import type { LegPair, RoutedLeg } from './planner-types.ts';
import type { Mode, RouteDay } from './route-types.ts';

// A Map keeps the LAST value written for a repeated key, so feeding it the
// entries reversed (and reversing the result back) keeps the FIRST occurrence
// of each pair — the same one the imperative "skip if already pending" kept.
const firstWins = (
  entries: readonly (readonly [string, LegPair])[],
): ReadonlyMap<string, LegPair> => new Map([...new Map([...entries].reverse())].reverse());

const pairsOf = (days: readonly RouteDay[]): readonly LegPair[] =>
  days.flatMap((day) =>
    day.legs.map((_leg, index) => ({ from: day.stops[index]!, to: day.stops[index + 1]! })),
  );

/** The origin→destination pairs of a route with no cache entry yet, keyed and
 *  de-duplicated — one lookup per distinct pair, however often it recurs. */
export const pendingLegPairs = (
  days: readonly RouteDay[],
  mode: Mode,
  cache: ReadonlyMap<string, RoutedLeg | undefined>,
): ReadonlyMap<string, LegPair> =>
  firstWins(
    pairsOf(days)
      .map((pair): readonly [string, LegPair] => [legKey(pair.from.id, pair.to.id, mode), pair])
      .filter(([key]) => !cache.has(key)),
  );
