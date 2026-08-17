// A saved route's on-disk shape. Types only — the parser and serialiser live
// one function per file next to this one.
import type { DayGroup, Mode } from '../../lib/favorites/build-route.ts';
import type { Times } from '../../lib/favorites/day-schedule.ts';
import type { FavPoi } from '../../lib/favorites/fav-pois.ts';
import type { DayHours } from '../../lib/favorites/day-hours.ts';
import type { Point } from '../../lib/favorites/base-point.ts';
import type { Durations } from './render-types.ts';

// `pois` embeds the data for any landmark/place stop in THIS route, so a shared
// or cross-device viewer resolves it without the author's localStorage.
// `dayStart`/`dayEnd` are this route's day window ('' = unset → global/default);
// `dayHours` holds per-day overrides.
export type Payload = Readonly<{
  mode: Mode;
  groups: readonly DayGroup[];
  durations: Durations;
  times: Times;
  // Manual pauses (minutes) to wait AFTER a stop before the next one, keyed by
  // the preceding stop's id — a break inserted into the day.
  pauses: Durations;
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
