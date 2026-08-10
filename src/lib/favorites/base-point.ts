// The traveller's base (accommodation): a point the day departs from and
// returns to, settable at three levels (day > route > global) like the day
// window. A day may also override just its FINAL point (end somewhere other than
// the base). Input is a map click, so a point is bare coordinates + a label.
import { haversineMeters, mapsDirUrl, travelMinutesBetween } from './build-route.ts';
import type { Leg, Mode } from './build-route.ts';

export type Point = Readonly<{ lat: number; lng: number; label?: string }>;

// The base to depart from / return to on a day, and an optional different final
// point for that day.
export type DayBase = Readonly<{ base?: Point | undefined; final?: Point | undefined }>;

export const effectiveBase = (
  day: string,
  perDay: Readonly<Record<string, Point>>,
  route: Point | undefined,
  global: Point | undefined,
): Point | undefined => perDay[day] ?? route ?? global;

/** Resolve a day's base (day > route > global) and its optional final point. */
export const resolveDayBase = (
  day: string,
  dayBases: Readonly<Record<string, Point>>,
  route: Point | undefined,
  global: Point | undefined,
  dayFinals: Readonly<Record<string, Point>>,
): DayBase => ({ base: effectiveBase(day, dayBases, route, global), final: dayFinals[day] });

/** A travel leg between two bare points (base ↔ a stop). */
export const legTo = (from: readonly [number, number], to: readonly [number, number], mode: Mode): Leg => ({
  meters: Math.round(haversineMeters(from, to)),
  minutes: travelMinutesBetween(from, to, mode),
  mapsUrl: mapsDirUrl(from, to, mode),
  tight: false,
});

const GLOBAL_KEY = 'dovego:base';

const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

export const asPoint = (v: unknown): Point | undefined => {
  const lat = num(Reflect.get(Object(v), 'lat'));
  const lng = num(Reflect.get(Object(v), 'lng'));
  if (lat === undefined || lng === undefined) return undefined;
  const label = Reflect.get(Object(v), 'label');
  return typeof label === 'string' ? { lat, lng, label } : { lat, lng };
};

export const readGlobalBase = (): Point | undefined => {
  try {
    return asPoint(JSON.parse(localStorage.getItem(GLOBAL_KEY) ?? '0'));
  } catch {
    return undefined;
  }
};

export const writeGlobalBase = (point: Point): void => {
  try {
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(point));
  } catch {
    /* storage blocked — ignore */
  }
};
