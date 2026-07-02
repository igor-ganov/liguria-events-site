import type { CompactEvent } from './event-schema.ts';

/** AND-composes with the category filter (AC-3.3). */
export const filterFreeOnly =
  (freeOnly: boolean) =>
  (events: readonly CompactEvent[]): readonly CompactEvent[] =>
    events.filter((event) => !freeOnly || event.f === true);
