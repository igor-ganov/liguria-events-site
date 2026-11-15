import { descriptionOf } from '../events/description-of.ts';
import { descriptionPlain } from '../description/description-plain.ts';
import { eventPath } from '../event-path.ts';
import { isUpcoming } from '../events/is-upcoming.ts';
import { regionOf } from '../region/region-of.ts';
import { cityName } from '../region/city-name.ts';
import { titleOf } from '../events/title-of.ts';
import { venueGroups } from './venue-groups.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { Locale } from '../i18n/locales.ts';
import type { SuggestDoc } from './suggest-doc.ts';

// Enough of a description for the letters to find a word in it; the file is
// fetched when the box is first touched, so it stays small.
const BODY = 160;

const eventDoc = (lang: Locale) => (event: CompactEvent): SuggestDoc => ({
  id: event.id,
  kind: 'event',
  title: titleOf(lang)(event),
  sub: event.v ?? cityName(event.ct ?? ''),
  path: eventPath(event),
  body: `${event.c.join(' ')} ${descriptionPlain(descriptionOf(lang)(event)).slice(0, BODY)}`,
  until: event.e ?? event.s,
});

/** What one region's search box can suggest in one language: its upcoming
 *  events and its venues that have a page. */
export const suggestDocs = (events: readonly CompactEvent[], region: string, lang: Locale, today: string): readonly SuggestDoc[] => [
  ...events.filter((event) => regionOf(event) === region).filter(isUpcoming(today)).map(eventDoc(lang)),
  ...venueGroups(events)
    .filter((venue) => venue.region === region)
    .map((venue): SuggestDoc => ({
      id: venue.id,
      kind: 'venue',
      title: venue.name,
      sub: venue.city,
      path: venue.path,
      body: venue.events.slice(0, 6).map(titleOf(lang)).join(' · '),
      until: '',
    })),
];
