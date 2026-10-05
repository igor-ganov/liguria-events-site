import { hereTarget } from './here-target.ts';
import { placeOfTarget } from './place-of-target.ts';
import type { LatLng } from '../geo/haversine-meters.ts';
import type { LocatedCity } from './here-target.ts';

/**
 * The place a position asks to be told about: the nearest town we cover, or the
 * region when the nearest town is too far to be theirs.
 *
 * The same resolution the picker's "near me" button uses, so a reader who turns
 * notifications on is subscribed to the place that button would have taken them
 * to — and the sender answers a town with the town's own evening.
 */
export const placeNear = (cities: readonly LocatedCity[], point: LatLng): string =>
  placeOfTarget(hereTarget('city', cities, point));
