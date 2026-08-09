// Parse/serialise a saved route's payload and load the corpus. Shared by the
// read-only view and the owner editor so both agree on the on-disk shape:
// { mode, dayIds: [{ day, ids }], durations }.
import type { DayGroup, Mode } from '../../lib/favorites/build-route.ts';
import { decodeEventList } from '../../lib/events/decode-event-list.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { Durations } from './route-render.ts';
import type { Times } from '../../lib/favorites/day-schedule.ts';

export type Payload = Readonly<{ mode: Mode; groups: readonly DayGroup[]; durations: Durations; times: Times }>;

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
  };
};

export const serializePayload = (p: Payload): string =>
  JSON.stringify({ mode: p.mode, dayIds: p.groups.map((g) => ({ day: g.day, ids: [...g.ids] })), durations: p.durations, times: p.times });

export const fetchCorpus = async (): Promise<readonly CompactEvent[]> => {
  try {
    const json: unknown = await (await fetch(EVENTS_URL)).json();
    const list = json && typeof json === 'object' && 'events' in json ? json.events : json;
    return decodeEventList(list);
  } catch {
    return [];
  }
};
