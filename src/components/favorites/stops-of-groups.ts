import { isDefined } from '../../lib/is-defined.ts';
import type { DayGroup, RouteStop } from '../../lib/favorites/build-route.ts';

/** Resolve one day's arranged ids to stops; ids the corpus no longer knows
 *  simply drop out. */
export const stopsOfGroups = (
  groups: readonly DayGroup[],
  day: string,
  byId: ReadonlyMap<string, RouteStop>,
): readonly RouteStop[] =>
  (groups.find((group) => group.day === day)?.ids ?? []).flatMap((id) =>
    [byId.get(id)].filter(isDefined),
  );
