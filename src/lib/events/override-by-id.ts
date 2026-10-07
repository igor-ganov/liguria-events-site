import type { CompactEvent } from './event-schema.ts';

/**
 * Take late events into a list already in hand: one the list has is replaced
 * where it stands — the late copy is the fresher — and one it has not is added
 * at the end.
 */
export const overrideById = (held: readonly CompactEvent[], late: readonly CompactEvent[]): readonly CompactEvent[] => {
  const fresher = new Map(late.map((event) => [event.id, event]));
  const known = new Set(held.map((event) => event.id));
  return [...held.map((event) => fresher.get(event.id) ?? event), ...late.filter((event) => !known.has(event.id))];
};
