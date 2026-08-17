import { axisRange } from '../../lib/favorites/day-schedule.ts';
import type { ScheduledStop } from '../../lib/favorites/day-schedule.ts';
import type { DayBounds } from './timeline-types.ts';

const HOUR = 60;

/** The axis a day is drawn on: the range its blocks span, extended down to the
 *  end of the day window so the ruler always reaches closing time. */
export const axisSpan = (
  items: readonly ScheduledStop[],
  bounds: DayBounds,
): Readonly<{ start: number; end: number }> => {
  const range = axisRange(items, bounds.startMin);
  return { start: range.start, end: Math.max(range.end, Math.ceil(bounds.endMin / HOUR) * HOUR) };
};
