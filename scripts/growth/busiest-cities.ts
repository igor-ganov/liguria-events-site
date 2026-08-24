import type { CompactEvent } from '../../src/lib/events/event-schema.ts';

/** The cities with the most on this week — where a weekly video has enough
 *  material to be worth making, and where anybody is likely to be watching. */
export const busiestCities = (
  events: readonly CompactEvent[],
  from: string,
  to: string,
  limit: number,
): readonly string[] => {
  const counts = new Map<string, number>();
  events
    .filter((event) => (event.img ?? '') !== '')
    .filter((event) => event.s <= to && (event.e ?? event.s) >= from)
    .forEach((event) => counts.set(event.ct ?? '', (counts.get(event.ct ?? '') ?? 0) + 1));
  counts.delete('');
  return [...counts.entries()]
    .toSorted((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([city]) => city);
};
