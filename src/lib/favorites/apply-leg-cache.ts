import { isDefined } from '../is-defined.ts';
import { applyRoutedLeg } from './apply-routed-leg.ts';
import { legKey } from './leg-key.ts';
import type { RoutedLeg } from './planner-types.ts';
import type { Mode, RouteDay } from './route-types.ts';

/** Synchronously apply whatever real routing is already cached to a freshly
 *  built day array. Pairs with no cached routing keep their estimate. A cache
 *  entry of `undefined` means "looked up, none available" (do not refetch). */
export const applyLegCache = (
  days: readonly RouteDay[],
  mode: Mode,
  cache: ReadonlyMap<string, RoutedLeg | undefined>,
): readonly RouteDay[] =>
  days.map((day) => ({
    ...day,
    legs: day.legs.map((leg, index) => {
      const from = day.stops[index]!;
      const to = day.stops[index + 1]!;
      const routed = cache.get(legKey(from.id, to.id, mode));
      return [routed].filter(isDefined).map((real) => applyRoutedLeg(leg, from, to, real)).at(0) ?? leg;
    }),
  }));
