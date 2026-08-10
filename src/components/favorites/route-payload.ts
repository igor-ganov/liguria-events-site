// Parse/serialise a saved route's payload and load the corpus. Shared by the
// read-only view and the owner editor so both agree on the on-disk shape:
// { mode, dayIds: [{ day, ids }], durations }.
import type { DayGroup, Mode } from '../../lib/favorites/build-route.ts';
import { decodeEventList } from '../../lib/events/decode-event-list.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { Durations } from './route-render.ts';
import type { Times } from '../../lib/favorites/day-schedule.ts';
import { parseFavPoiMap } from '../../lib/favorites/fav-pois.ts';
import type { FavPoi } from '../../lib/favorites/fav-pois.ts';
import type { DayHours } from '../../lib/favorites/day-hours.ts';
import { asPoint } from '../../lib/favorites/base-point.ts';
import type { Point } from '../../lib/favorites/base-point.ts';

// `pois` embeds the data for any landmark/place stop in THIS route, so a shared
// or cross-device viewer resolves it without the author's localStorage.
// `dayStart`/`dayEnd` are this route's day window ('' = unset → global/default);
// `dayHours` holds per-day overrides.
export type Payload = Readonly<{
  mode: Mode;
  groups: readonly DayGroup[];
  durations: Durations;
  times: Times;
  pois: Readonly<Record<string, FavPoi>>;
  dayStart: string;
  dayEnd: string;
  dayHours: Readonly<Record<string, DayHours>>;
  // The base (accommodation) the route departs from / returns to, and per-day
  // overrides; `dayFinals` lets a day END at a different point than the base.
  base: Point | undefined;
  dayBases: Readonly<Record<string, Point>>;
  dayFinals: Readonly<Record<string, Point>>;
}>;

const field = (obj: unknown, key: string): unknown => (Object(obj) === obj ? Reflect.get(Object(obj), key) : undefined);

const asMode = (v: unknown): Mode => (v === 'driving' || v === 'transit' ? v : 'walking');

const asDurations = (v: unknown): Durations => {
  const out: Record<string, number> = {};
  if (v && typeof v === 'object') {
    for (const [id, min] of Object.entries(v)) if (typeof min === 'number') out[id] = min;
  }
  return out;
};

const asTimes = (v: unknown): Times => {
  const out: Record<string, string> = {};
  if (v && typeof v === 'object') {
    for (const [id, t] of Object.entries(v)) if (typeof t === 'string') out[id] = t;
  }
  return out;
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const asTime = (v: unknown): string => (typeof v === 'string' && TIME_RE.test(v) ? v : '');

const asDayHours = (v: unknown): Readonly<Record<string, DayHours>> => {
  const out: Record<string, DayHours> = {};
  if (v && typeof v === 'object') {
    for (const [day, h] of Object.entries(v)) {
      const start = asTime(field(h, 'start'));
      const end = asTime(field(h, 'end'));
      if (start !== '' && end !== '') out[day] = { start, end };
    }
  }
  return out;
};

const asPointMap = (v: unknown): Readonly<Record<string, Point>> => {
  const out: Record<string, Point> = {};
  if (v && typeof v === 'object') {
    for (const [day, p] of Object.entries(v)) {
      const point = asPoint(p);
      if (point) out[day] = point;
    }
  }
  return out;
};

const asGroups = (v: unknown): readonly DayGroup[] =>
  Array.isArray(v)
    ? v.flatMap((d) => {
        const day = field(d, 'day');
        const list = field(d, 'ids');
        if (typeof day !== 'string' || !Array.isArray(list)) return [];
        return [{ day, ids: list.filter((x): x is string => typeof x === 'string') }];
      })
    : [];

export const parsePayload = (raw: string): Payload => {
  const json: unknown = JSON.parse(raw);
  return {
    mode: asMode(field(json, 'mode')),
    groups: asGroups(field(json, 'dayIds')),
    durations: asDurations(field(json, 'durations')),
    times: asTimes(field(json, 'times')),
    pois: parseFavPoiMap(field(json, 'pois')),
    dayStart: asTime(field(json, 'dayStart')),
    dayEnd: asTime(field(json, 'dayEnd')),
    dayHours: asDayHours(field(json, 'dayHours')),
    base: asPoint(field(json, 'base')),
    dayBases: asPointMap(field(json, 'dayBases')),
    dayFinals: asPointMap(field(json, 'dayFinals')),
  };
};

export const serializePayload = (p: Payload): string =>
  JSON.stringify({
    mode: p.mode,
    dayIds: p.groups.map((g) => ({ day: g.day, ids: [...g.ids] })),
    durations: p.durations,
    times: p.times,
    pois: p.pois,
    dayStart: p.dayStart,
    dayEnd: p.dayEnd,
    dayHours: p.dayHours,
    base: p.base,
    dayBases: p.dayBases,
    dayFinals: p.dayFinals,
  });

export const fetchCorpus = async (): Promise<readonly CompactEvent[]> => {
  try {
    const json: unknown = await (await fetch(EVENTS_URL)).json();
    const list = json && typeof json === 'object' && 'events' in json ? json.events : json;
    return decodeEventList(list);
  } catch {
    return [];
  }
};
