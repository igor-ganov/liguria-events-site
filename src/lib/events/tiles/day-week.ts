import { monthGrid } from '../thread/month-grid.ts';
import type { CalendarMonth, DayMark } from '../thread/calendar-types.ts';
import type { CompactEvent } from '../event-schema.ts';

const markOf =
  (event: CompactEvent, day: string, today: string) =>
  (iso: string): DayMark =>
    [
      { when: iso < event.s || iso > (event.e ?? event.s), mark: 'off' as const },
      { when: iso === day && day >= today, mark: 'next' as const },
      { when: iso < today, mark: 'gone' as const },
    ].find((rule) => rule.when)?.mark ?? 'on';

/**
 * The week a dated event falls in, as one row of its month's wall calendar:
 * the day the page is about filled, the other days of a span ringed or, once
 * gone, crossed out. What the month tile shows when there is no run of
 * sessions to draw.
 */
export const dayWeek = (event: CompactEvent, day: string, today: string): CalendarMonth => {
  const month = monthGrid(markOf(event, day, today))(day.slice(0, 7));
  const week = month.weeks.filter((cells) => cells.some((cell) => cell.kind === 'day' && cell.iso === day));
  return { month: month.month, weeks: week };
};
