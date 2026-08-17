import type { RouteDay } from '../../lib/favorites/build-route.ts';

/** How many stops precede a day, so its rows continue the running numbering
 *  across the whole trip rather than restarting each day. */
export const stopOffset = (days: readonly RouteDay[], index: number): number =>
  days.slice(0, index).reduce((total, day) => total + day.stops.length, 0);
