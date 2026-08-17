import type { Durations } from '../../lib/favorites/day-schedule.ts';

const STANDARD_BREAK = 60;

/** Drop a standard one-hour break after a stop, lengthening one already there. */
export const addPause = (pauses: Durations, after: string): Durations => ({
  ...pauses,
  [after]: (pauses[after] ?? 0) + STANDARD_BREAK,
});
