import { MIN_DUR } from './min-dur.ts';
import { PX_PER_MIN } from './px-per-min.ts';
import { snapMinutes } from '../../lib/favorites/day-schedule.ts';

/** Dragging the TOP edge moves the start and keeps the end put, so the duration
 *  absorbs the travel. The start cannot pass the point that would shrink the
 *  block below the minimum. */
export const resizeTopWindow = (
  origStart: number,
  origDur: number,
  dy: number,
): Readonly<{ startMin: number; durMin: number }> => {
  const startMin = snapMinutes(Math.min(origStart + dy / PX_PER_MIN, origStart + origDur - MIN_DUR));
  return { startMin, durMin: origStart + origDur - startMin };
};
