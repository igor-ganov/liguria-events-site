import type { CompactEvent } from '../event-schema.ts';

/**
 * The day the top of the page is about. For a run of sessions, the next one
 * (the last, once the run is over); for an event that owns a span of days,
 * today while it is on and its first day otherwise.
 */
export const focusDay = (event: CompactEvent, days: readonly string[], today: string): string =>
  days.find((day) => day >= today) ??
  days.at(-1) ??
  [today].find((day) => day >= event.s && day <= (event.e ?? event.s)) ??
  event.s;
