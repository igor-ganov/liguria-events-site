import type { CompactEvent } from './event-schema.ts';
import { coversDay } from './covers-day.ts';
import { isLongRunning } from './is-long-running.ts';

/** Cell contents (AC-2.3): short events on every covered day, long ones
 *  only on their start day (their run lives in the Ongoing list). */
export const dayCellEvents =
  (day: string) =>
  (events: readonly CompactEvent[]): readonly CompactEvent[] =>
    events.filter(
      (event) => coversDay(day)(event) && (event.s === day || !isLongRunning(event)),
    );
