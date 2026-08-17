import { omitKey } from './omit-key.ts';
import type { Durations } from '../../lib/favorites/day-schedule.ts';

const DEFAULT_PAUSE = 60;

/** Move a break from one anchor stop to another, merging into any break the
 *  target already has. Re-dropping it on its own anchor is a no-op. */
export const movePause = (pauses: Durations, from: string, to: string): Durations => {
  const rest = omitKey(pauses, from);
  return { ...rest, [to]: (rest[to] ?? 0) + (pauses[from] ?? DEFAULT_PAUSE) };
};
