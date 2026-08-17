import type { RouteDay } from '../../lib/favorites/build-route.ts';

/** Stop numbering runs on across the whole route, not per day. This is each
 *  day's starting offset — how many stops the days before it hold. */
export const dayNumbers = (days: readonly RouteDay[]): readonly number[] =>
  days.map((_, index) =>
    days.slice(0, index).reduce((total, day) => total + day.stops.length, 0),
  );
