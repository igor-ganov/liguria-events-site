// Lay a day's stops onto a minute-of-day axis for the timeline view. The stops
// are a strict SEQUENCE (their list order): the first starts at the day's
// opening, each next one after the previous plus travel. There are no overlaps
// and no lanes — dragging reorders the sequence, which reflows the times.
import { placeStop } from './place-stop.ts';
import type { Placement } from './place-stop.ts';
import type { Mode, RouteStop } from './build-route.ts';
import type { Durations, ScheduledStop, Times } from './day-schedule-types.ts';

/** Place a day's stops on the minute axis. A stop pinned to a time (via `times`)
 *  sits there or later; an unpinned one flows after the previous stop plus travel
 *  and any manual pause. `offSchedule` flags a stop whose block sticks out of the
 *  event's official window. */
export const buildDaySchedule = (
  stops: readonly RouteStop[],
  mode: Mode,
  times: Times,
  durations: Durations,
  pauses: Durations,
  dayStartMin: number,
): readonly ScheduledStop[] => {
  const start: Placement = { placed: [], prevEnd: dayStartMin };
  return stops.reduce(placeStop({ mode, times, durations, pauses }), start).placed;
};
