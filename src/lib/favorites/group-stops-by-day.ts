import { dayOfStop } from './day-of-stop.ts';
import type { DateRange, RouteStop } from './route-types.ts';

/** Group stops under the ISO day each is visited on, keeping input order
 *  within a day (the ordering pass runs afterwards). */
export const groupStopsByDay = (
  stops: readonly RouteStop[],
  range: DateRange | undefined,
): ReadonlyMap<string, readonly RouteStop[]> =>
  stops.reduce((byDay, stop) => {
    const day = dayOfStop(stop, range);
    return byDay.set(day, [...(byDay.get(day) ?? []), stop]);
  }, new Map<string, readonly RouteStop[]>());
