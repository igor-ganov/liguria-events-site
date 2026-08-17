import { baseLegRow } from './base-leg-row.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { legTo } from '../../lib/favorites/base-point.ts';
import type { DayBase, Point } from '../../lib/favorites/base-point.ts';
import type { Coords, Mode, RouteDay } from '../../lib/favorites/build-route.ts';
import type { Ui } from './render-types.ts';

const row = (
  pair: readonly (Point | Coords | undefined)[],
  make: (from: Point, at: Coords) => string,
): string =>
  [pair].filter((p): p is readonly [Point, Coords] => p.every(isDefined)).map(([p, at]) => make(p, at)).join('');

/** The "depart from base" row (before the first stop) and "return to base/final"
 *  row (after the last), for a day with a base set. */
export const baseLegs = (
  day: RouteDay,
  db: DayBase | undefined,
  mode: Mode,
  ui: Ui,
): Readonly<{ before: string; after: string }> => ({
  before: row([db?.base, day.stops[0]?.g], (p, at) =>
    baseLegRow(legTo([p.lat, p.lng], at, mode), ui.route.fromBase, mode, ui),
  ),
  after: row([db?.final ?? db?.base, day.stops.at(-1)?.g], (p, at) =>
    baseLegRow(legTo(at, [p.lat, p.lng], mode), ui.route.toBase, mode, ui),
  ),
});
