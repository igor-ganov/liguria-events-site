import { monthAfter } from './month-after.ts';
import { monthGrid } from './month-grid.ts';
import type { CalendarMonth, DayMark } from './calendar-types.ts';

const markOf =
  (days: ReadonlySet<string>, next: string | undefined, today: string) =>
  (iso: string): DayMark =>
    [
      { when: !days.has(iso), mark: 'off' as const },
      { when: iso === next, mark: 'next' as const },
      { when: iso < today, mark: 'gone' as const },
    ].find((rule) => rule.when)?.mark ?? 'on';

const monthsFrom = (first: string, last: string, count: number): readonly string[] =>
  Array.from({ length: count })
    .reduce<readonly string[]>((months) => [...months, monthAfter(months.at(-1) ?? first)], [first])
    .slice(0, count)
    .filter((month) => month <= last);

/**
 * The months of a run as a wall calendar: it opens on the month of the next
 * session — so the ones already gone that month are there, crossed out — and
 * goes on for `count` months, never past the month of the last session. A run
 * that is over shows the month it ended in.
 */
export const sessionCalendar = (days: readonly string[], today: string, count = 3): readonly CalendarMonth[] => {
  const next = days.find((day) => day >= today);
  const last = days.at(-1) ?? today;
  const first = (next ?? last).slice(0, 7);
  return monthsFrom(first, last.slice(0, 7), count).map(monthGrid(markOf(new Set(days), next, today)));
};
