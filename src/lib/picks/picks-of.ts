import { addDays } from './add-days.ts';
import { pickScore } from './pick-score.ts';
import type { CompactEvent } from '../events/event-schema.ts';

export type Picks = Readonly<{
  day: CompactEvent | undefined;
  week: CompactEvent | undefined;
  month: CompactEvent | undefined;
  strip: readonly CompactEvent[];
}>;

const STRIP_MIN = 4;
const STRIP_MAX = 8;

// One card per event: a programme arrives as one occurrence per evening, and
// the soonest of them stands for the event.
const oncePerEvent = (events: readonly CompactEvent[]): readonly CompactEvent[] =>
  [...events]
    .sort((a, b) => a.s.localeCompare(b.s))
    .filter((event, index, all) => all.findIndex((other) => other.id === event.id) === index);

// Best first; the id settles a tie, so the same day always gives the same pick
// whatever order the corpus arrived in.
const ranked = (events: readonly CompactEvent[]): readonly CompactEvent[] =>
  [...events].sort((a, b) => pickScore(b) - pickScore(a) || a.id.localeCompare(b.id));

const onBetween = (from: string, to: string) => (event: CompactEvent): boolean => event.s <= to && (event.e ?? event.s) >= from;

/**
 * The event of the day, of the week and of the month, and a strip of what else
 * starts this week. Each is a different event, each has a photograph, and the
 * strip is empty rather than thin: fewer than four is not a selection.
 */
export const picksOf = (events: readonly CompactEvent[], today: string): Picks => {
  const pool = oncePerEvent(events.filter((event) => event.img !== undefined && (event.e ?? event.s) >= today));
  const best = (to: string, taken: readonly (CompactEvent | undefined)[]): readonly CompactEvent[] =>
    ranked(pool.filter(onBetween(today, to)).filter((event) => !taken.some((other) => other?.id === event.id)));
  const day = best(today, []).at(0);
  const week = best(addDays(today, 6), [day]).at(0);
  const month = best(addDays(today, 29), [day, week]).at(0);
  const starting = best(addDays(today, 6), [day, week, month]).filter((event) => event.s >= today);
  // Chosen by merit, shown in the order of the week: a strip that jumps from
  // Thursday back to Monday reads as a mistake, whatever put Thursday first.
  const chosen = starting.slice(0, STRIP_MAX).filter(() => starting.length >= STRIP_MIN);
  return { day, week, month, strip: [...chosen].sort((a, b) => a.s.localeCompare(b.s) || a.id.localeCompare(b.id)) };
};
