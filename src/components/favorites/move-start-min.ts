import { PX_PER_MIN } from './px-per-min.ts';
import { snapMinutes } from '../../lib/favorites/day-schedule.ts';

/** The start a moved block lands on: snapped to the grid and never before
 *  midnight. */
export const moveStartMin = (origStart: number, dy: number): number =>
  Math.max(0, snapMinutes(origStart + dy / PX_PER_MIN));
