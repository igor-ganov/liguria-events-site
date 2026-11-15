import { descriptionPlain } from '../description/description-plain.ts';
import { isUpcoming } from '../events/is-upcoming.ts';
import { regionOf } from '../region/region-of.ts';
import { cityName } from '../region/city-name.ts';
import { venueGroups } from './venue-groups.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { EmbedDoc } from './suggest-doc.ts';

// bge-m3 reads up to 8k tokens, but a short passage keeps a document's vector
// about what it is rather than the small print, and keeps the build's token
// bill — and so its share of the free daily allowance — small.
const SUMMARY = 400;

const eventText = (event: CompactEvent): string =>
  [event.t, event.tl?.en ?? '', event.c.join(', '), event.v ?? '', cityName(event.ct ?? ''), descriptionPlain(event.d?.en ?? '').slice(0, SUMMARY)]
    .filter((part) => part !== '')
    .join('. ');

/**
 * What the build embeds, for every region at once: each upcoming event in its
 * own words and English, and each venue by what it hosts — its kinds of event
 * and their titles — so "concerto pianoforte" finds the hall that has them.
 * One multilingual model reads every language, so there is one text per item,
 * not one per locale.
 */
export const embedDocs = (events: readonly CompactEvent[], today: string): readonly EmbedDoc[] => [
  ...events.filter(isUpcoming(today)).map((event) => ({ id: event.id, region: regionOf(event), until: event.e ?? event.s, text: eventText(event) })),
  ...venueGroups(events).map((venue) => ({
    id: venue.id,
    region: venue.region,
    until: '',
    text: `${venue.name}, ${venue.city}. ${[...new Set(venue.events.flatMap((event) => event.c))].join(', ')}. ${venue.events.slice(0, 8).map((event) => event.t).join('; ')}`,
  })),
];
