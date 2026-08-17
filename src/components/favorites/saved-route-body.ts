import { pickDurations } from './pick-durations.ts';
import type { DateRange, Mode, RouteDay } from '../../lib/favorites/build-route.ts';
import type { Durations, Times } from '../../lib/favorites/day-schedule.ts';
import type { FavPoi } from '../../lib/favorites/fav-pois.ts';

export type SaveInput = Readonly<{
  mode: Mode;
  range: DateRange;
  days: readonly RouteDay[];
  durations: Durations;
  times: Times;
  pauses: Durations;
  pois: Readonly<Record<string, FavPoi>>;
}>;

/** The stored payload of a generated route: the arrangement (day → ids) plus
 *  everything a reopened copy needs to look identical anywhere. */
export const savedRouteBody = (input: SaveInput): string =>
  JSON.stringify({
    mode: input.mode,
    range: input.range,
    dayIds: input.days.map((day) => ({ day: day.day, ids: day.stops.map((stop) => stop.id) })),
    durations: pickDurations(input.days, input.durations),
    times: input.times,
    pauses: input.pauses,
    pois: input.pois,
  });
