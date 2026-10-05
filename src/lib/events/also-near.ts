import { branch } from '../branch.ts';
import { editionKey } from './edition-key.ts';
import { isUpcoming } from './is-upcoming.ts';
import { regionOf } from '../region/region-of.ts';
import type { CompactEvent } from './event-schema.ts';

/** Six: enough to be a choice, few enough that the page does not end in a
 *  second feed. */
const SHOWN = 6;

const DAY_MS = 86_400_000;

const days = (from: string, to: string): number =>
  Math.abs(Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / DAY_MS;

// A town when the event has one, the region when it does not: a record with
// no town still belongs somewhere, and "nearby" has to mean something for it.
const sameTown = (event: CompactEvent, here: CompactEvent): boolean =>
  branch((here.ct ?? '') === '')(
    () => regionOf(event) === regionOf(here),
    () => (event.ct ?? '') === (here.ct ?? ''),
  );

/**
 * What else is on around this one, in the same town.
 *
 * An event page offered one way onward — the whole region — and other years of
 * itself, and nothing else: not its own town, not the concert on the next
 * street that night. For a crawler it is the same gap: the only path to an
 * event page was scrolling a feed, and 17 of 96 sampled pages were indexed.
 *
 * Nearest in time first, because a reader deciding what to do on a date wants
 * that date. Another year of the same event is left out: the editions block
 * says so already, and saying it twice reads like a bug.
 */
export const alsoNear = (
  all: readonly CompactEvent[],
  here: CompactEvent,
  today: string,
): readonly CompactEvent[] =>
  all
    .filter((event) => event.id !== here.id)
    .filter((event) => editionKey(event) !== editionKey(here))
    .filter((event) => sameTown(event, here))
    .filter(isUpcoming(today))
    .toSorted(
      (left, right) => days(here.s, left.s) - days(here.s, right.s) || left.s.localeCompare(right.s),
    )
    .slice(0, SHOWN);
