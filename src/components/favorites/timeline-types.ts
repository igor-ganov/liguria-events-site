// The shapes the day timeline markup is written against. Types only.
import type { RouteStop } from '../../lib/favorites/build-route.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Payload } from './payload-types.ts';

/** Everything a timeline render needs besides the days themselves. */
export type TimelineOpts = Readonly<{
  payload: Payload;
  byId: ReadonlyMap<string, RouteStop>;
  lang: Locale;
  editable: boolean;
}>;

/** A single day's rendering context: the render options plus that day's id and
 *  the minute its axis starts at (block positions are relative to it). */
export type DayCtx = Readonly<{ opts: TimelineOpts; day: string; start: number }>;

/** The day window in minutes since midnight. */
export type DayBounds = Readonly<{ startMin: number; endMin: number }>;
