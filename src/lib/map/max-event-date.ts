import type { CompactEvent } from '../events/event-schema.ts';

/**
 * The last day any event runs to — the upper bound the map's two date pickers
 * accept. `today` joins the comparison, so a set that has entirely finished
 * still yields a bound that is not in the past.
 */
export const maxEventDate =
  (today: string) =>
  (events: readonly CompactEvent[]): string =>
    [today, ...events.map((event) => event.e ?? event.s)].sort().at(-1) ?? today;
