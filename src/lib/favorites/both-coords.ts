import { isDefined } from '../is-defined.ts';
import type { Coords, RouteStop } from './route-types.ts';

/** The two endpoints of a leg as a 0-or-1 element list: a hop where either stop
 *  lacks coordinates has no geometry to work with, and the empty list carries
 *  that without a guard clause. */
export const bothCoords = (
  from: RouteStop,
  to: RouteStop,
): readonly Readonly<{ a: Coords; b: Coords }>[] =>
  [from.g].filter(isDefined).flatMap((a) => [to.g].filter(isDefined).map((b) => ({ a, b })));
