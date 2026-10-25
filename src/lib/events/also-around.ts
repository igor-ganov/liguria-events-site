import { alsoAtVenue } from './also-at-venue.ts';
import { alsoNear } from './also-near.ts';
import type { AtVenue } from './also-at-venue.ts';
import type { CompactEvent } from './event-schema.ts';

/** The two strips under an event: its venue's other shows, then the town's. */
export type AlsoAround = Readonly<{ venue: AtVenue; town: readonly CompactEvent[] }>;

/**
 * What else is on at this event's venue, and in its town besides.
 *
 * The town strip is drawn from what the venue strip left: a show already
 * offered as "at this venue" read as a bug when it came back as "in town".
 */
export const alsoAround = (all: readonly CompactEvent[], here: CompactEvent, today: string): AlsoAround => {
  const venue = alsoAtVenue(all, here, today);
  const offered = new Set(venue.shown.map((event) => event.id));
  return { venue, town: alsoNear(all.filter((event) => !offered.has(event.id)), here, today) };
};
