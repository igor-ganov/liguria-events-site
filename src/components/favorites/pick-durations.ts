import { isDefined } from '../../lib/is-defined.ts';
import type { Durations } from '../../lib/favorites/day-schedule.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';

/** Only the manual duration overrides that belong to THIS route, so a shared
 *  view shows the durations the author set (a viewer has no localStorage). */
export const pickDurations = (days: readonly RouteDay[], overrides: Durations): Durations =>
  Object.fromEntries(
    days
      .flatMap((day) => day.stops)
      .flatMap((stop): readonly (readonly [string, number])[] =>
        [overrides[stop.id]].filter(isDefined).map((min) => [stop.id, min]),
      ),
  );
