import { asDayHoursMap } from './as-day-hours-map.ts';
import { asGroups } from './as-groups.ts';
import { asNumberMap } from './as-number-map.ts';
import { asPointMap } from './as-point-map.ts';
import { asStringMap } from './as-string-map.ts';
import { asTime } from './as-time.ts';
import { fieldOf } from './field-of.ts';
import { toMode } from './to-mode.ts';
import { asPoint } from '../../lib/favorites/base-point.ts';
import { parseFavPoiMap } from '../../lib/favorites/fav-pois.ts';
import type { Payload } from './payload-types.ts';

/** Read a saved route's stored JSON, defaulting every field that is missing or
 *  corrupted — a shared link must open even when its payload is half-broken. */
export const parsePayload = (raw: string): Payload => {
  const json: unknown = JSON.parse(raw);
  return {
    mode: toMode(fieldOf(json, 'mode')),
    groups: asGroups(fieldOf(json, 'dayIds')),
    durations: asNumberMap(fieldOf(json, 'durations')),
    times: asStringMap(fieldOf(json, 'times')),
    pauses: asNumberMap(fieldOf(json, 'pauses')),
    pois: parseFavPoiMap(fieldOf(json, 'pois')),
    dayStart: asTime(fieldOf(json, 'dayStart')),
    dayEnd: asTime(fieldOf(json, 'dayEnd')),
    dayHours: asDayHoursMap(fieldOf(json, 'dayHours')),
    base: asPoint(fieldOf(json, 'base')),
    dayBases: asPointMap(fieldOf(json, 'dayBases')),
    dayFinals: asPointMap(fieldOf(json, 'dayFinals')),
  };
};
