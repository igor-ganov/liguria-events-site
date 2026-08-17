import { pickKey } from './pick-key.ts';
import type { PickKey, PickMode } from './pick-mode.ts';
import type { Payload } from './route-payload.ts';
import type { Point } from '../../lib/favorites/base-point.ts';

type Setter = (payload: Payload, day: string, point: Point) => Payload;

// A GLOBAL base is not part of the route — it is written to localStorage by the
// caller, so here it leaves the payload untouched.
const SET: Readonly<Record<PickKey, Setter>> = {
  global: (payload) => payload,
  route: (payload, _day, point) => ({ ...payload, base: point }),
  'day-base': (payload, day, point) => ({
    ...payload,
    dayBases: { ...payload.dayBases, [day]: point },
  }),
  'day-final': (payload, day, point) => ({
    ...payload,
    dayFinals: { ...payload.dayFinals, [day]: point },
  }),
};

/** The route payload after a map click resolved an armed base picker. */
export const payloadWithPoint = (payload: Payload, pick: PickMode, point: Point): Payload =>
  SET[pickKey(pick)](payload, pick.day ?? '', point);
