import { byUniqueness } from './by-uniqueness.ts';
import { expandSessions } from './expand-sessions.ts';
import { groupByDay } from './group-by-day.ts';
import type { CompactEvent } from './event-schema.ts';

/** One feed day: its ISO date and the events shown under that heading. */
export type DayGroup = readonly [string, readonly CompactEvent[]];

/**
 * Within each day, lead with the unique, time-pinned events (short span) and
 * sink the long runs. The server emits this order so the default "By date" sort
 * is a no-op on first load — no reflow — while keeping the curation.
 */
export const feedDayGroups =
  (today: string) =>
  (events: readonly CompactEvent[]): readonly DayGroup[] =>
    [...groupByDay(today)(expandSessions(events, today)).entries()].map(
      ([day, dayEvents]): DayGroup => [day, [...dayEvents].sort(byUniqueness)],
    );
