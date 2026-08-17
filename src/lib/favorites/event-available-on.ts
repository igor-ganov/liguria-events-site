import type { RouteStop } from './route-types.ts';

/** Whether an event can be scheduled on a given ISO day — its span [s, e]
 *  (single-day when `e` is absent) must cover that day. Governs which days a
 *  stop may be moved to and where a favourite may be added. */
export const eventAvailableOn = (event: RouteStop, day: string): boolean =>
  event.s <= day && day <= (event.e ?? event.s);
