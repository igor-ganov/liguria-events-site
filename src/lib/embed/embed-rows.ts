import { BCP47 } from '../i18n/bcp47.ts';
import { canonicalUrl } from '../seo/canonical-url.ts';
import { ENTRY_LOCALE } from '../i18n/entry-locale.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { EmbedTarget } from './embed-target.ts';
import { eventPath } from '../event-path.ts';
import { eventsOfVenue } from '../events/events-of-venue.ts';
import { isUpcoming } from '../events/is-upcoming.ts';

/** One line of the widget: when it is, what it is, and where it lives on our site. */
export type EmbedRow = Readonly<{ when: string; title: string; href: string }>;

const MAX_ROWS = 6;

const whenOf = (event: CompactEvent): string => {
  const day = new Date(`${event.s}T12:00:00`).toLocaleDateString(BCP47[ENTRY_LOCALE], {
    day: 'numeric',
    month: 'long',
  });
  // `h` is the start time the crawler recorded; plenty of events have none.
  return [event.h].filter((time) => time !== undefined).map((time) => `${day}, ${time}`).at(0) ?? day;
};

/**
 * A venue's programme, as the widget on its own site shows it.
 *
 * Italian, like the venue's own page: the reader is standing in Italy looking at
 * an Italian theatre's website. Absolute links, because this HTML is served
 * inside somebody else's page.
 */
export const embedRows = (
  events: readonly CompactEvent[],
  target: EmbedTarget,
  today: string,
  site: URL | undefined,
): readonly EmbedRow[] =>
  eventsOfVenue(events, target.region, target.city, target.slug)
    .filter(isUpcoming(today))
    .toSorted((left, right) => left.s.localeCompare(right.s))
    .slice(0, MAX_ROWS)
    .map((event) => ({
      when: whenOf(event),
      title: event.t,
      href: canonicalUrl(ENTRY_LOCALE, eventPath(event), site),
    }));
