import { addMonths } from './add-months.ts';
import { monthKeyOf } from './month-key-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';

// How far ahead a calendar is worth building. The corpus holds events announced
// into 2029 — following them built 804 month pages, most of them for a month
// with one entry. What is further out is still on its own page, in the feed and
// in the events sitemap.
const HORIZON = 3;

const later = (left: string, right: string): string => [left, right].sort().at(-1) ?? left;
const earlier = (left: string, right: string): string => [left, right].sort().at(0) ?? left;

const asIndex = (monthKey: string): number => {
  const [year, month] = monthKey.split('-').map(Number);
  return (year ?? 0) * 12 + (month ?? 1) - 1;
};

/**
 * Every month the calendar is built for: from last month to one past the last
 * event, and no further ahead than the horizon.
 *
 * It follows neither end of the corpus, because the corpus is not a calendar.
 * Following the oldest event built a page per region per locale for every month
 * since 2024, and following the newest built them into 2029: 975 URLs one way
 * and 804 the other, each listing nothing or nearly nothing, offered to a
 * crawler that manages a dozen fetches a day. A month that has passed has an
 * archive; a month three years out has an event page.
 */
export const eventMonths = (events: readonly CompactEvent[], today: string): readonly string[] => {
  const thisMonth = monthKeyOf(today);
  const ends = events.flatMap((event) => [monthKeyOf(event.s), monthKeyOf(event.e ?? event.s)]).sort();
  const first = addMonths(thisMonth, -1);
  const last = earlier(
    later(addMonths(ends.at(-1) ?? thisMonth, 1), thisMonth),
    addMonths(thisMonth, HORIZON),
  );
  return Array.from({ length: asIndex(last) - asIndex(first) + 1 }, (_, index) =>
    addMonths(first, index),
  );
};
