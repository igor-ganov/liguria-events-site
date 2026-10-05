import type { CompactEvent } from './event-schema.ts';

/**
 * The days a list of events covers, counted from today.
 *
 * It is what a page is about as much as the place is — "Genova, 5 ottobre –
 * 2 novembre" says more than a count does, and an assistant quoting the page
 * then quotes a date rather than an impression.
 *
 * The near end is clipped to today because a listing of what is coming cannot
 * begin in the past: Genova's corpus holds an exhibition that opened on
 * 2 January, which made the city's page announce itself as starting then.
 */
export const feedSpan = (
  events: readonly CompactEvent[],
  today: string,
): Readonly<{ from: string; to: string }> | undefined =>
  [events]
    .filter((list) => list.length > 0)
    .map((list) => ({
      from: [list.map((event) => event.s).toSorted().at(0) ?? '', today].toSorted().at(-1) ?? today,
      to: list.map((event) => event.e ?? event.s).toSorted().at(-1) ?? '',
    }))
    .at(0);
