import type { CompactEvent } from '../events/event-schema.ts';
import type { FavPoi } from './fav-pois.ts';

export type Mode = 'walking' | 'driving' | 'transit';

// A route stop is an event OR a landmark/place. Both share the fields the route
// pipeline needs (id, title, coords, duration); a POI adds `href` (its own
// detail link, since it isn't an /event/ page) and no date/time — it's
// available on any day of the trip.
export type RouteStop = CompactEvent & Readonly<{ href?: string }>;

/** Resolve a favourited landmark/place into a stop: no fixed time, a wide date
 *  span (so it's available every day), and a 60-minute default duration. */
export const poiToStop = (poi: FavPoi): RouteStop => ({
  id: poi.id,
  t: poi.name,
  s: '0000-01-01',
  e: '9999-12-31',
  c: ['other'],
  g: [poi.lat, poi.lng],
  u: poi.url,
  href: poi.url,
  du: 60,
});

// Rough average speeds (m/s) for the travel-time ESTIMATE only — the real
// turn-by-turn comes from the Google Maps deep-link. Transit is deliberately
// conservative (includes waiting).
const SPEED_MPS: Readonly<Record<Mode, number>> = { walking: 1.3, driving: 7.5, transit: 5.5 };

export type Leg = Readonly<{
  meters: number;
  minutes: number;
  mapsUrl: string;
  /** The previous timed event plus travel overshoots this stop's start time. */
  tight: boolean;
  /** Real routed geometry as [lng, lat] pairs, once enriched from transit data
   *  (undefined for the straight-line estimate). */
  geometry?: readonly (readonly [number, number])[];
  /** true once upgraded from the straight-line estimate to real routing. */
  real?: boolean;
  /** Transfers on a real transit leg (undefined for walking/estimate). */
  transfers?: number;
}>;

export type RouteDay = Readonly<{ day: string; stops: readonly RouteStop[]; legs: readonly Leg[] }>;

/** A saved route's explicit arrangement: one entry per day, event ids in the
 *  exact order the user arranged them. */
export type DayGroup = Readonly<{ day: string; ids: readonly string[] }>;

/** The trip window. `from` is the first day (the caller defaults it to today);
 *  `to` is optional — without it the trip runs to the last favourited day. */
export type DateRange = Readonly<{ from: string; to?: string }>;

// An event belongs to the trip when its own span [s, e] overlaps [from, to].
const inRange = (event: RouteStop, range: DateRange): boolean =>
  (event.e ?? event.s) >= range.from && (range.to === undefined || event.s <= range.to);

// Which day to visit it on: its start, or the trip start if it is already
// running when the trip begins (an ongoing multi-day event).
const displayDay = (event: RouteStop, from: string): string =>
  event.s > from ? event.s : from;

/** Whether an event can be scheduled on a given ISO day — its span [s, e]
 *  (single-day when `e` is absent) must cover that day. Governs which days a
 *  stop may be moved to and where a favourite may be added. */
export const eventAvailableOn = (event: RouteStop, day: string): boolean =>
  event.s <= day && day <= (event.e ?? event.s);

const EARTH_R = 6371000;
const rad = (d: number): number => (d * Math.PI) / 180;

export const haversineMeters = (a: readonly [number, number], b: readonly [number, number]): number => {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(h));
};

/** Estimated travel time (minutes) between two points for the chosen mode —
 *  the same estimate legs use, exposed for the timeline's auto-scheduling. */
export const travelMinutesBetween = (
  a: readonly [number, number],
  b: readonly [number, number],
  mode: Mode,
): number => Math.max(1, Math.round(haversineMeters(a, b) / SPEED_MPS[mode] / 60));

/** Google Maps directions deep-link between two points for the chosen mode. */
export const mapsDirUrl = (
  from: readonly [number, number],
  to: readonly [number, number],
  mode: Mode,
): string =>
  `https://www.google.com/maps/dir/?api=1&origin=${from[0]},${from[1]}&destination=${to[0]},${to[1]}&travelmode=${mode}`;

/** Minutes-since-midnight for an `HH:MM` clock time, or undefined when absent
 *  or malformed. Exposed so the async routing enrichment can recompute a leg's
 *  `tight` flag with real travel times. */
export const minutesOf = (time: string | undefined): number | undefined => {
  const m = time && /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : undefined;
  return m ? Number(m.slice(0, 2)) * 60 + Number(m.slice(3)) : undefined;
};

const coord = (event: RouteStop): readonly [number, number] | undefined => event.g;

// Order a day's events: timed ones in chronological order (the fixed
// constraints), then the untimed ones as a nearest-neighbour chain from the
// last placed point — so "whenever" stops still form a sensible path.
const orderDay = (events: readonly RouteStop[]): readonly RouteStop[] => {
  const timed = events
    .filter((e) => minutesOf(e.h) !== undefined)
    .toSorted((a, b) => (minutesOf(a.h) ?? 0) - (minutesOf(b.h) ?? 0));
  const untimed = events.filter((e) => minutesOf(e.h) === undefined);
  const ordered: RouteStop[] = [...timed];
  const pool = [...untimed];
  const lastCoord = (): readonly [number, number] | undefined =>
    [...ordered].reverse().map(coord).find((c) => c !== undefined);
  while (pool.length > 0) {
    const anchor = lastCoord();
    const next =
      anchor === undefined
        ? pool[0]!
        : pool.toSorted((a, b) => {
            const ca = coord(a);
            const cb = coord(b);
            const da = ca ? haversineMeters(anchor, ca) : Number.POSITIVE_INFINITY;
            const db = cb ? haversineMeters(anchor, cb) : Number.POSITIVE_INFINITY;
            return da - db;
          })[0]!;
    ordered.push(next);
    pool.splice(pool.indexOf(next), 1);
  }
  return ordered;
};

const legBetween = (from: RouteStop, to: RouteStop, mode: Mode): Leg => {
  const a = coord(from);
  const b = coord(to);
  const meters = a && b ? Math.round(haversineMeters(a, b)) : 0;
  const minutes = Math.max(1, Math.round(meters / SPEED_MPS[mode] / 60));
  const depart = minutesOf(from.h);
  const arrive = minutesOf(to.h);
  const tight = depart !== undefined && arrive !== undefined && depart + minutes > arrive;
  const mapsUrl = a && b ? mapsDirUrl(a, b, mode) : '';
  return { meters, minutes, mapsUrl, tight };
};

/** Build the itinerary: one section per day, each with its stops ordered and
 *  the legs between them. A `range` limits the trip to events overlapping the
 *  window (ongoing events clamped to the trip start); without it, all events
 *  are scheduled on their own start day. */
export const buildRoute = (
  events: readonly RouteStop[],
  mode: Mode,
  range?: DateRange,
): readonly RouteDay[] => {
  const scoped = range === undefined ? events : events.filter((event) => inRange(event, range));
  const byDay = new Map<string, RouteStop[]>();
  for (const event of scoped) {
    const day = range === undefined ? event.s : displayDay(event, range.from);
    (byDay.get(day) ?? byDay.set(day, []).get(day)!).push(event);
  }
  return [...byDay.keys()]
    .toSorted()
    .map((day) => {
      const stops = orderDay(byDay.get(day) ?? []);
      const legs = stops.slice(1).map((stop, i) => legBetween(stops[i]!, stop, mode));
      return { day, stops, legs };
    });
};

/** Build the itinerary from an explicit, user-arranged set of day groups —
 *  the saved/edited shape. Unlike buildRoute this preserves the exact order
 *  within each day (no re-sorting); ids missing from `byId` (events that have
 *  since left the corpus) drop out, and a day left empty is removed. */
export const routeFromGroups = (
  groups: readonly DayGroup[],
  mode: Mode,
  byId: ReadonlyMap<string, RouteStop>,
): readonly RouteDay[] =>
  groups
    .map((group) => {
      const stops = group.ids.flatMap((id) => {
        const event = byId.get(id);
        return event ? [event] : [];
      });
      const legs = stops.slice(1).map((stop, i) => legBetween(stops[i]!, stop, mode));
      return { day: group.day, stops, legs };
    })
    .filter((day) => day.stops.length > 0);
