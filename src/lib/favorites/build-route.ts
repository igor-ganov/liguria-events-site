import type { CompactEvent } from '../events/event-schema.ts';

export type Mode = 'walking' | 'driving' | 'transit';

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
}>;

export type RouteDay = Readonly<{ day: string; stops: readonly CompactEvent[]; legs: readonly Leg[] }>;

/** The trip window. `from` is the first day (the caller defaults it to today);
 *  `to` is optional — without it the trip runs to the last favourited day. */
export type DateRange = Readonly<{ from: string; to?: string }>;

// An event belongs to the trip when its own span [s, e] overlaps [from, to].
const inRange = (event: CompactEvent, range: DateRange): boolean =>
  (event.e ?? event.s) >= range.from && (range.to === undefined || event.s <= range.to);

// Which day to visit it on: its start, or the trip start if it is already
// running when the trip begins (an ongoing multi-day event).
const displayDay = (event: CompactEvent, from: string): string =>
  event.s > from ? event.s : from;

const EARTH_R = 6371000;
const rad = (d: number): number => (d * Math.PI) / 180;

export const haversineMeters = (a: readonly [number, number], b: readonly [number, number]): number => {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(h));
};

/** Google Maps directions deep-link between two points for the chosen mode. */
export const mapsDirUrl = (
  from: readonly [number, number],
  to: readonly [number, number],
  mode: Mode,
): string =>
  `https://www.google.com/maps/dir/?api=1&origin=${from[0]},${from[1]}&destination=${to[0]},${to[1]}&travelmode=${mode}`;

const minutesOf = (time: string | undefined): number | undefined => {
  const m = time && /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : undefined;
  return m ? Number(m.slice(0, 2)) * 60 + Number(m.slice(3)) : undefined;
};

const coord = (event: CompactEvent): readonly [number, number] | undefined => event.g;

// Order a day's events: timed ones in chronological order (the fixed
// constraints), then the untimed ones as a nearest-neighbour chain from the
// last placed point — so "whenever" stops still form a sensible path.
const orderDay = (events: readonly CompactEvent[]): readonly CompactEvent[] => {
  const timed = events
    .filter((e) => minutesOf(e.h) !== undefined)
    .toSorted((a, b) => (minutesOf(a.h) ?? 0) - (minutesOf(b.h) ?? 0));
  const untimed = events.filter((e) => minutesOf(e.h) === undefined);
  const ordered: CompactEvent[] = [...timed];
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

const legBetween = (from: CompactEvent, to: CompactEvent, mode: Mode): Leg => {
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
  events: readonly CompactEvent[],
  mode: Mode,
  range?: DateRange,
): readonly RouteDay[] => {
  const scoped = range === undefined ? events : events.filter((event) => inRange(event, range));
  const byDay = new Map<string, CompactEvent[]>();
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
