import type { CompactEvent } from '../../../src/lib/events/event-schema.ts';

/** The events a weekly reel is made of: on in the window, with a photograph to
 *  show, soonest first. A slide with no picture is a slide with nothing on it. */
export const pickReelEvents = (
  events: readonly CompactEvent[],
  from: string,
  to: string,
  limit: number,
): readonly CompactEvent[] =>
  events
    .filter((event) => (event.img ?? '') !== '')
    .filter((event) => event.s <= to && (event.e ?? event.s) >= from)
    .toSorted((a, b) => a.s.localeCompare(b.s))
    .slice(0, limit);
