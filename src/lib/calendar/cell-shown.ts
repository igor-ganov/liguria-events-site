import type { CompactEvent } from '../events/event-schema.ts';

/** What one day of a calendar prints, and how much it is not printing. */
export type CellShown = Readonly<{ shown: readonly CompactEvent[]; more: number }>;

/**
 * A day's events, capped.
 *
 * A single day of the country's calendar carries fifty events, and a cell that
 * prints all fifty is not a calendar — it is a feed with a grid drawn round it.
 * The busiest regions were already close to that on their own. What is left out
 * is counted rather than dropped silently.
 */
export const cellShown = (events: readonly CompactEvent[], max: number): CellShown => ({
  shown: events.slice(0, max),
  more: Math.max(0, events.length - max),
});
