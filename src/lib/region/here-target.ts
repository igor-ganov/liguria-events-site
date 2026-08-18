import { branch } from '../branch.ts';
import { nearestOf } from '../geo/nearest-of.ts';
import { regionAt } from './region-at.ts';
import type { LatLng } from '../geo/haversine-meters.ts';

/** A city row of the picker that carries a point. */
export type LocatedCity = Readonly<{ region: string; city: string; lat: number; lng: number }>;

/** Where "here" lands: a region always, a city when one is genuinely nearby. */
export type HereTarget = Readonly<{ region: string; city?: string }>;

// Beyond this, the nearest city with events is not the visitor's city — it is
// just the closest one we happen to cover. Falling back to the region says
// "nothing of yours nearby" instead of teleporting them across the country.
const NEAR_ENOUGH_M = 100_000;

/**
 * Resolve a position to a place in the picker. `region` mode answers from the
 * region boxes alone, so it works everywhere in Italy; `city` mode picks the
 * nearest city that actually has events, and gives up to the region when the
 * nearest one is too far to be theirs.
 */
export const hereTarget = (
  mode: 'city' | 'region',
  cities: readonly LocatedCity[],
  point: LatLng,
): HereTarget => {
  const region = regionAt(point);
  return branch(mode === 'region')<HereTarget>(
    () => ({ region }),
    () =>
      nearestOf(cities, point)
        .filter((hit) => hit.meters <= NEAR_ENOUGH_M)
        .map((hit): HereTarget => ({ region: hit.item.region, city: hit.item.city }))
        .at(0) ?? { region },
  );
};
