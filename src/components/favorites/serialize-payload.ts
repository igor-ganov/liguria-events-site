import type { Payload } from './payload-types.ts';

/** Write a route's payload back in its on-disk shape:
 *  { mode, dayIds: [{ day, ids }], durations, … }. */
export const serializePayload = (p: Payload): string =>
  JSON.stringify({
    mode: p.mode,
    dayIds: p.groups.map((g) => ({ day: g.day, ids: [...g.ids] })),
    durations: p.durations,
    times: p.times,
    pauses: p.pauses,
    pois: p.pois,
    dayStart: p.dayStart,
    dayEnd: p.dayEnd,
    dayHours: p.dayHours,
    base: p.base,
    dayBases: p.dayBases,
    dayFinals: p.dayFinals,
  });
