import { branch } from '../branch.ts';
import { editionKey } from './edition-key.ts';
import { eventsOfVenue } from './events-of-venue.ts';
import { hasRealVenue } from './has-real-venue.ts';
import { isUpcoming } from './is-upcoming.ts';
import { regionOf } from '../region/region-of.ts';
import { slugify } from '../slugify.ts';
import type { CompactEvent } from './event-schema.ts';

/** Eight, as on the venue's own page under "what happened here": a row a
 *  reader takes in, and the venue page is one link away for the rest. */
const SHOWN = 8;

/** The venue's other shows to put on an event page. */
export type AtVenue = Readonly<{ shown: readonly CompactEvent[] }>;

// A season that opened in February is on tonight: it is dated by the day a
// reader can go, never before today.
const from = (today: string) => (event: CompactEvent): string =>
  [event.s, today].toSorted().at(-1) ?? today;

const others = (all: readonly CompactEvent[], here: CompactEvent, today: string): readonly CompactEvent[] =>
  eventsOfVenue(all, regionOf(here), here.ct ?? '', slugify(here.v ?? ''))
    .filter((event) => event.id !== here.id)
    .filter((event) => editionKey(event) !== editionKey(here))
    .filter(isUpcoming(today))
    .toSorted((left, right) => from(today)(left).localeCompare(from(today)(right)) || left.s.localeCompare(right.s));

/**
 * What else is on at this event's venue, soonest first.
 *
 * A reader at one show of a theatre wants its other shows; the town strip
 * mixed them into everything nearby, six at a time. A venue that is not a
 * place — "various places", the town's own name — offers nothing. The strip
 * always ends at the venue's page, so the rest are one link away.
 */
export const alsoAtVenue = (all: readonly CompactEvent[], here: CompactEvent, today: string): AtVenue => ({
  shown: branch(hasRealVenue(here))(() => others(all, here, today), () => []).slice(0, SHOWN),
});
