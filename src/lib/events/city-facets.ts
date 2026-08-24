import { CATEGORIES } from './categories.ts';
import { occursBetween } from './occurs-between.ts';
import { weekendOf } from './weekend-of.ts';
import type { CompactEvent } from './event-schema.ts';

/** A named narrowing of a city's feed, addressable as its own page. */
export type Facet = Readonly<{
  slug: string;
  /** The events this facet shows, out of a city's events. */
  narrow: (events: readonly CompactEvent[], today: string) => readonly CompactEvent[];
}>;

const DAY_MS = 86_400_000;
const nextDay = (today: string): string =>
  new Date(Date.parse(`${today}T12:00:00Z`) + DAY_MS).toISOString().slice(0, 10);

const onDay = (day: string) => (events: readonly CompactEvent[]) => events.filter(occursBetween(day, day));

// Date windows go through occursBetween, the predicate the feed, the map and
// the calendar already share — so a festival with no evening today does not
// turn up under "today" just because its advertised run covers the date.
export const FACETS: readonly Facet[] = [
  { slug: 'today', narrow: (events, today) => onDay(today)(events) },
  { slug: 'tomorrow', narrow: (events, today) => onDay(nextDay(today))(events) },
  {
    slug: 'this-weekend',
    narrow: (events, today) => {
      const { from, to } = weekendOf(today);
      return events.filter(occursBetween(from, to));
    },
  },
  { slug: 'free', narrow: (events) => events.filter((event) => event.f === true) },
  // One facet per category, minus "other": nobody searches for other events.
  // The slug is the category id, so the vocabulary stays ours rather than being
  // translated three ways into three sets of URLs.
  ...CATEGORIES.filter((category) => category !== 'other').map((category) => ({
    slug: category,
    narrow: (events: readonly CompactEvent[]) => events.filter((event) => event.c.includes(category)),
  })),
];
