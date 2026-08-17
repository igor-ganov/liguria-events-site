import { isDefined } from '../is-defined.ts';
import { dayWithLegs } from './day-with-legs.ts';
import type { DayGroup, Mode, RouteDay, RouteStop } from './route-types.ts';

/** Build the itinerary from an explicit, user-arranged set of day groups —
 *  the saved/edited shape. Unlike buildRoute this preserves the exact order
 *  within each day (no re-sorting); ids missing from `byId` (events that have
 *  since left the corpus) drop out, and a day left empty is removed. */
export const routeFromGroups = (
  groups: readonly DayGroup[],
  mode: Mode,
  byId: ReadonlyMap<string, RouteStop>,
): readonly RouteDay[] =>
  groups
    .map((group) =>
      dayWithLegs(group.day, group.ids.flatMap((id) => [byId.get(id)].filter(isDefined)), mode),
    )
    .filter((day) => day.stops.length > 0);
