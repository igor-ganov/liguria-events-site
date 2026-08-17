import { isDefined } from '../../lib/is-defined.ts';
import { eventDuration } from '../../lib/favorites/event-duration.ts';
import type { RouteStop } from '../../lib/favorites/build-route.ts';
import type { ScheduledStop } from '../../lib/favorites/day-schedule.ts';
import type { Durations } from './render-types.ts';

/** The duration a block carries for the drag maths: the stop's attendance
 *  length, or the block's own height for a break (which has no event). */
export const blockDuration = (
  item: ScheduledStop,
  event: RouteStop | undefined,
  durations: Durations,
): number =>
  [event].filter(isDefined).map((e) => eventDuration(e, durations[item.id])).at(0) ??
  item.endMin - item.startMin;
