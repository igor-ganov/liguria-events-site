import type { RouteDay, RouteStop } from '../../lib/favorites/build-route.ts';

/** One day's stops out of a built itinerary; empty when the day is not in it. */
export const stopsOfDay = (days: readonly RouteDay[], day: string): readonly RouteStop[] =>
  days.find((section) => section.day === day)?.stops ?? [];
