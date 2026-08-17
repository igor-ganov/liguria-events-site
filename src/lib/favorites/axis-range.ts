import { branch } from '../branch.ts';
import type { ScheduledStop } from './day-schedule-types.ts';
import type { Window } from './official-window.ts';

const EMPTY_SPAN = 120;
const HOUR = 60;

const spanning = (items: readonly ScheduledStop[], dayStartMin: number): Window => {
  const start = Math.floor(Math.min(dayStartMin, ...items.map((i) => i.startMin)) / HOUR) * HOUR;
  const end = Math.ceil(Math.max(...items.map((i) => i.endMin)) / HOUR) * HOUR;
  return { start, end: Math.max(end, start + HOUR) };
};

/** The visible time window: whole hours spanning the day start and every block,
 *  at least an hour tall. */
export const axisRange = (items: readonly ScheduledStop[], dayStartMin: number): Window =>
  branch(items.length === 0)<Window>(
    () => ({ start: dayStartMin, end: dayStartMin + EMPTY_SPAN }),
    () => spanning(items, dayStartMin),
  );
