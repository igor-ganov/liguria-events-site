import type { CompactEvent } from '../../lib/events/event-schema.ts';

/** Comparator ordering events by their ISO start day, earliest first. Booleans
 *  as numbers give the -1 / 0 / 1 of the ternary chain it replaces. */
export const byStart = (a: CompactEvent, b: CompactEvent): number =>
  Number(a.s > b.s) - Number(a.s < b.s);
