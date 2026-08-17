import { isDefined } from '../is-defined.ts';
import { maxIso } from '../events/max-iso.ts';
import type { DateRange, RouteStop } from './route-types.ts';

/** Which day to visit a stop on: its own start, or the trip start when it is
 *  already running when the trip begins (an ongoing multi-day event). Without a
 *  trip window a stop simply sits on its start day. */
export const dayOfStop = (stop: RouteStop, range: DateRange | undefined): string =>
  [range].filter(isDefined).map((window) => maxIso(stop.s, window.from)).at(0) ?? stop.s;
