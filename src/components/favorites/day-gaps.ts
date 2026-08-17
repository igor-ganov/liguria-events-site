import { timelineGap } from './timeline-gap.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';
import type { ScheduledStop } from '../../lib/favorites/day-schedule.ts';
import type { DayCtx } from './timeline-types.ts';

/** The gaps of a whole day — one per stop except the first, which nothing
 *  precedes. */
export const dayGaps = (day: RouteDay, items: readonly ScheduledStop[], ctx: DayCtx): string =>
  items
    .slice(1)
    .map((item, i) => timelineGap(item, day.stops[i]?.id ?? '', items[i]?.endMin ?? 0, ctx))
    .join('');
