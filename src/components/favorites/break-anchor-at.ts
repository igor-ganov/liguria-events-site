import type { ScheduledStop } from '../../lib/favorites/day-schedule.ts';

/** The stop whose gap a break dragged to `startMin` falls into — its new
 *  anchor. A break dropped above the first stop stays anchored to it. */
export const breakAnchorAt = (
  schedule: readonly ScheduledStop[],
  startMin: number,
): string | undefined =>
  schedule.filter((stop) => stop.startMin <= startMin).at(-1)?.id ?? schedule.at(0)?.id;
