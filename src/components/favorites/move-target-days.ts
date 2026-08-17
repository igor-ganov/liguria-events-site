import { eventAvailableOn } from '../../lib/favorites/build-route.ts';
import type { DayGroup, RouteStop } from '../../lib/favorites/build-route.ts';

/** Other days in the route the event may move to — days it's available on
 *  (its span covers them), excluding the day it's already on. */
export const moveTargetDays = (
  groups: readonly DayGroup[],
  event: RouteStop,
  current: string,
): readonly string[] =>
  groups.map((group) => group.day).filter((day) => day !== current && eventAvailableOn(event, day));
