import { MIN_DUR } from './min-dur.ts';
import { PX_PER_MIN } from './px-per-min.ts';
import { snapMinutes } from '../../lib/favorites/day-schedule.ts';

/** The duration a bottom-edge drag lands on: the original stretched by the
 *  pointer travel, snapped to the grid and never below the minimum. */
export const snapDuration = (origDur: number, dy: number): number =>
  Math.max(MIN_DUR, snapMinutes(origDur + dy / PX_PER_MIN));
