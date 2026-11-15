import { canonicalUrl } from './canonical-url.ts';
import { eventDateTime } from './event-datetime.ts';
import { eventHour } from '../events/event-hour.ts';
import { descriptionPlain } from '../description/description-plain.ts';
import { eventPath } from '../event-path.ts';
import { isUpcoming } from '../events/is-upcoming.ts';
import { sortByStart } from '../events/sort-by-start.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { RssItem } from './rss-xml.ts';

// Enough to be worth subscribing to, small enough to stay a feed rather than a
// dump of the whole corpus.
const CAP = 50;

// The start as an instant: the hour on Rome's clock, in Rome's offset that day
// — not the same digits read as Greenwich, which put a 21:00 concert at 22:00.
const dateOf = (event: CompactEvent): string =>
  new Date(eventDateTime(event.s, eventHour(event) ?? '12:00')).toUTCString();

/** The soonest upcoming events as feed entries, soonest first. */
export const eventRssItems = (
  events: readonly CompactEvent[],
  today: string,
  site: URL | undefined,
): readonly RssItem[] =>
  sortByStart(events.filter(isUpcoming(today)))
    .slice(0, CAP)
    .map((event) => ({
      title: event.t,
      link: canonicalUrl('en', eventPath(event), site),
      guid: event.id,
      pubDate: dateOf(event),
      description: descriptionPlain(event.d?.en ?? '').slice(0, 500),
    }));
