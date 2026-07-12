import { monthKeyOf } from './month-key-of.ts';
import { addMonths } from './add-months.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/** Every month key the events span, plus one either side so month navigation
 *  always lands on a prerendered page. */
export const eventMonths = (events: readonly CompactEvent[], today: string): readonly string[] => {
  const keys = [
    monthKeyOf(today),
    ...events.flatMap((event) => [monthKeyOf(event.s), monthKeyOf(event.e ?? event.s)]),
  ].sort();
  const first = addMonths(keys[0] ?? monthKeyOf(today), -1);
  const last = addMonths(keys[keys.length - 1] ?? monthKeyOf(today), 1);
  const months: string[] = [];
  let cursor = first;
  while (cursor <= last) {
    months.push(cursor);
    cursor = addMonths(cursor, 1);
  }
  return months;
};
