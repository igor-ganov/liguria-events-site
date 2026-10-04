import { slugify } from '../slugify.ts';
import type { ArchivedEvent } from './archived-schema.ts';

/** Eight is what a reader scans without scrolling past the invitation below
 *  it. A venue's whole history belongs in the archive, not on its page. */
const SHOWN = 8;

const endOf = (event: ArchivedEvent): string => event.e ?? event.s;

const newestFirst = (left: ArchivedEvent, right: ArchivedEvent): number =>
  endOf(right).localeCompare(endOf(left)) || left.t.localeCompare(right.t);

type At = Readonly<{ city: string; slug: string; today: string }>;

/**
 * What has already happened at one venue.
 *
 * The corpus holds only what is still to come, so a venue with an empty month
 * ahead reads as a place where nothing ever happens. The collector keeps every
 * record that left the feed; this is that list, narrowed to one venue and
 * newest first, because the last thing that happened is the one worth naming.
 *
 * Matched on the slugified venue name and the town: the archive carries no
 * region, and two towns can hold a Palazzo Ducale each.
 */
export const pastAtVenue = (
  archive: readonly ArchivedEvent[],
  { city, slug, today }: At,
): readonly ArchivedEvent[] =>
  archive
    .filter((event) => event.v !== undefined && slugify(event.v) === slug)
    .filter((event) => (event.ct ?? '') === city)
    .filter((event) => endOf(event) < today)
    .toSorted(newestFirst)
    .slice(0, SHOWN);
