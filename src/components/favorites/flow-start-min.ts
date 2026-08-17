import type { ScheduledStop } from '../../lib/favorites/day-schedule.ts';

/** Where the sequence puts a stop on its own — the time it would start at with
 *  no pin. `fallback` covers a stop the schedule does not contain. */
export const flowStartMin = (
  schedule: readonly ScheduledStop[],
  id: string,
  fallback: number,
): number => schedule.find((stop) => stop.id === id)?.startMin ?? fallback;
