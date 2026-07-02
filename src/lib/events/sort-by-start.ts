import type { CompactEvent } from './event-schema.ts';

export const sortByStart = (
  events: readonly CompactEvent[],
): readonly CompactEvent[] =>
  events.toSorted(
    (a, b) => Math.sign(a.s.localeCompare(b.s)) * 2 + Math.sign(a.t.localeCompare(b.t)),
  );
