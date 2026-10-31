import { byDayOrder } from './by-day-order.ts';
import { expandSessions } from './expand-sessions.ts';
import { groupByDay } from './group-by-day.ts';
import type { CompactEvent } from './event-schema.ts';

/** One feed day: its ISO date and the events shown under that heading. */
export type DayGroup = readonly [string, readonly CompactEvent[]];

/**
 * Each day reads by the clock: the events that happen at a time lead, in the
 * order of their hours, and what is on all day follows (byDayOrder). The server
 * emits this order so the default "By date" sort is a no-op on first load.
 */
export const feedDayGroups =
  (today: string) =>
  (events: readonly CompactEvent[]): readonly DayGroup[] =>
    [...groupByDay(today)(expandSessions(events, today)).entries()].map(
      ([day, dayEvents]): DayGroup => [day, [...dayEvents].sort(byDayOrder(day))],
    );
