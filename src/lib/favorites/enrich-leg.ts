import { isDefined } from '../is-defined.ts';
import { applyRoutedLeg } from './apply-routed-leg.ts';
import { planLeg } from './plan-leg.ts';
import type { Planner } from './planner-types.ts';
import type { Leg, Mode, RouteStop } from './route-types.ts';

/** Upgrade one leg to real routing, or keep its estimate when the planner has
 *  nothing to offer for that pair. */
export const enrichLeg = async (
  leg: Leg,
  from: RouteStop,
  to: RouteStop,
  mode: Mode,
  plan: Planner,
): Promise<Leg> => {
  const routed = await planLeg(plan, from, to, mode);
  return [routed].filter(isDefined).map((real) => applyRoutedLeg(leg, from, to, real)).at(0) ?? leg;
};
