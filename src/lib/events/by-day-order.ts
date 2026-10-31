import { branch } from '../branch.ts';
import { byHour } from './by-hour.ts';
import { byUniqueness } from './by-uniqueness.ts';
import { isTimedOn } from './is-timed-on.ts';
import type { CompactEvent } from './event-schema.ts';

const partOf = (timed: boolean): number =>
  branch(timed)(
    () => 0,
    () => 1,
  );

/**
 * The order of one feed day: what happens at a time first, by the clock; what
 * is on all day after it, made here and then shortest first. The server renders
 * this order, and the browser's default sort restores it without moving a card.
 */
export const byDayOrder =
  (day: string) =>
  (a: CompactEvent, b: CompactEvent): number => {
    const timed = isTimedOn(day);
    return (
      partOf(timed(a)) - partOf(timed(b)) ||
      branch(timed(a))(
        () => byHour(a, b),
        () => byUniqueness(a, b),
      )
    );
  };
