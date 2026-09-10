import { editionKey } from './edition-key.ts';
import type { ArchivedEvent } from './archived-schema.ts';

/** Six is more than any festival anybody has kept a page for, and few enough
 *  that the list stays a list rather than a second feed. */
const LIMIT = 6;

const yearOf = (event: ArchivedEvent): string => event.s.slice(0, 4);

/** One year appears once. Two records of a single edition are a duplicate the
 *  deduper has not caught yet, and rendering them as two editions would
 *  advertise our own bug; the first one seen wins. */
const byYear = (found: readonly ArchivedEvent[]): readonly ArchivedEvent[] => [
  ...new Map(found.map((event) => [yearOf(event), event])).values(),
];

/**
 * The same event in other years, newest first.
 *
 * An event that runs every year is one thing with many editions, and the site
 * held them as strangers: thousands of archived pages, each a dead end, and
 * this year's page never mentioning that last year's exists.
 */
export const otherEditions = (
  event: ArchivedEvent,
  all: readonly ArchivedEvent[],
): readonly ArchivedEvent[] =>
  byYear(
    all
      .filter((candidate) => editionKey(candidate) === editionKey(event))
      .filter((candidate) => yearOf(candidate) !== yearOf(event))
      .toSorted((a, b) => b.s.localeCompare(a.s)),
  ).slice(0, LIMIT);
