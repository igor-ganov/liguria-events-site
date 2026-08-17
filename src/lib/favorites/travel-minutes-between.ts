import { haversineMeters } from './haversine-meters.ts';
import { minutesForMeters } from './minutes-for-meters.ts';
import type { Coords, Mode } from './route-types.ts';

/** Estimated travel time (minutes) between two points for the chosen mode —
 *  the same estimate legs use, exposed for the timeline's auto-scheduling. */
export const travelMinutesBetween = (a: Coords, b: Coords, mode: Mode): number =>
  minutesForMeters(haversineMeters(a, b), mode);
