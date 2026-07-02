import type { CompactEvent } from './event-schema.ts';

/** Hidden-gem / unusual filter; composes (AND) with the other filters. */
export const filterGemsOnly =
  (gemsOnly: boolean) =>
  (events: readonly CompactEvent[]): readonly CompactEvent[] =>
    events.filter((event) => !gemsOnly || event.x === true);
