import { branch } from '../branch.ts';
import { canonicalUrl } from './canonical-url.ts';
import { citiesWithEvents } from '../region/cities-with-events.ts';
import { cityName } from '../region/city-name.ts';
import { ENTRY_LOCALE } from '../i18n/entry-locale.ts';
import { llmsLine } from './llms-line.ts';
import type { CompactEvent } from '../events/event-schema.ts';

// Enough to say what the site covers without becoming a second sitemap: the
// busiest places are the ones a question is likely to be about.
const CITIES = 40;

const listed = (count: number): string =>
  `${count} ${branch(count === 1)(() => 'event', () => 'events')} listed`;

/** The busiest cities, with what each one's page offers beyond its feed. */
export const cityLines = (
  events: readonly CompactEvent[],
  site: URL | undefined,
): readonly string[] =>
  citiesWithEvents(events)
    .map((place) => ({ ...place, count: events.filter((event) => (event.ct ?? '') === place.city).length }))
    .toSorted((a, b) => b.count - a.count)
    .slice(0, CITIES)
    .map((place) =>
      llmsLine(
        cityName(place.city),
        canonicalUrl(ENTRY_LOCALE, `${place.region}/${place.city}/`, site),
        `${listed(place.count)}, with pages for today, tomorrow and the weekend`,
      ),
    );
