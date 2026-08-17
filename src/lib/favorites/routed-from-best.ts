import { legSegments } from './leg-segments.ts';
import { minutesFromSec } from './minutes-from-sec.ts';
import type { BestLeg } from 'italian-transport-core';
import type { RoutedLeg } from './planner-types.ts';

/** The planner's answer reduced to what a leg (and its cache entry) needs. */
export const routedFromBest = (best: BestLeg): RoutedLeg => ({
  meters: best.meters,
  minutes: minutesFromSec(best.durationSec),
  geometry: best.geometry,
  transfers: best.transfers,
  segments: legSegments(best),
});
