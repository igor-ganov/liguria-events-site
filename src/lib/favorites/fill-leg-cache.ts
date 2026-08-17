import { defaultPlanner } from './default-planner.ts';
import { pendingLegPairs } from './pending-leg-pairs.ts';
import { planLeg } from './plan-leg.ts';
import type { Planner, RoutedLeg } from './planner-types.ts';
import type { Mode, RouteDay } from './route-types.ts';

/** Fetch real routing for any pair not yet in the cache and store it (storing
 *  `undefined` for pairs the planner can't serve, so they are not refetched).
 *  Resolves true when at least one real leg was newly added — the caller then
 *  re-renders to show it. */
export const fillLegCache = async (
  days: readonly RouteDay[],
  mode: Mode,
  cache: Map<string, RoutedLeg | undefined>,
  plan: Planner = defaultPlanner,
): Promise<boolean> => {
  const results = await Promise.all(
    [...pendingLegPairs(days, mode, cache)].map(async ([key, pair]) => ({
      key,
      routed: await planLeg(plan, pair.from, pair.to, mode),
    })),
  );
  results.forEach(({ key, routed }) => cache.set(key, routed));
  return results.some(({ routed }) => routed !== undefined);
};
