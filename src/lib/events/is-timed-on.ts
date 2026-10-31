import { isLongRunning } from './is-long-running.ts';
import type { CompactEvent } from './event-schema.ts';

/**
 * Whether an event happens AT a time on a feed day: it has an hour, it starts
 * that day, and it is not a long run. Everything else is simply on all day — an
 * exhibition's opening hour or yesterday's start of a festival is not the time
 * a reader can turn up, and showing it as one sends them at the wrong hour.
 */
export const isTimedOn =
  (day: string) =>
  (event: CompactEvent): boolean =>
    event.h !== undefined && event.s === day && !isLongRunning(event);
