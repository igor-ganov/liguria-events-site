import { haversineMeters } from './haversine-meters.ts';
import { mapsDirUrl } from './maps-dir-url.ts';
import { travelMinutesBetween } from './travel-minutes-between.ts';
import type { Leg, Mode } from './route-types.ts';

/** A travel leg between two bare points (base ↔ a stop). */
export const legTo = (from: readonly [number, number], to: readonly [number, number], mode: Mode): Leg => ({
  meters: Math.round(haversineMeters(from, to)),
  minutes: travelMinutesBetween(from, to, mode),
  mapsUrl: mapsDirUrl(from, to, mode),
  tight: false,
});
