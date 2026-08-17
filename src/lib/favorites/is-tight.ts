import { minutesOf } from './minutes-of.ts';
import type { RouteStop } from './route-types.ts';

/** Does leaving `from` at its fixed time and travelling for `minutes` overshoot
 *  `to`'s fixed start? Only two timed stops can be tight — an untimed stop
 *  bends around the schedule. */
export const isTight = (from: RouteStop, to: RouteStop, minutes: number): boolean => {
  const depart = minutesOf(from.h);
  const arrive = minutesOf(to.h);
  return depart !== undefined && arrive !== undefined && depart + minutes > arrive;
};
