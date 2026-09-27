import { addMonths } from './add-months.ts';
import { monthKeyOf } from './month-key-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';

const later = (left: string, right: string): string => [left, right].sort().at(-1) ?? left;

const asIndex = (monthKey: string): number => {
  const [year, month] = monthKey.split('-').map(Number);
  return (year ?? 0) * 12 + (month ?? 1) - 1;
};

/**
 * Every month the calendar is built for: from last month to one past the last
 * event — one either side of what there is, so month navigation always lands on
 * a page that exists.
 *
 * It does not reach back to the oldest event. The corpus holds things that ran
 * in 2024, and following them built a calendar page per region per locale for
 * every month since: 975 URLs in the sitemap, each listing nothing, offered to
 * a crawler that manages a dozen fetches a day. A month that has passed has an
 * archive; it does not need a calendar.
 */
export const eventMonths = (events: readonly CompactEvent[], today: string): readonly string[] => {
  const thisMonth = monthKeyOf(today);
  const ends = events.flatMap((event) => [monthKeyOf(event.s), monthKeyOf(event.e ?? event.s)]).sort();
  const first = addMonths(thisMonth, -1);
  const last = later(addMonths(ends.at(-1) ?? thisMonth, 1), thisMonth);
  return Array.from({ length: asIndex(last) - asIndex(first) + 1 }, (_, index) =>
    addMonths(first, index),
  );
};
