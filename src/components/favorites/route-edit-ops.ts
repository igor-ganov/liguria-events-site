// Pure operations on a route's day groups — the semantics of the owner editor,
// kept free of the DOM so they can be unit-tested. Each returns a new groups
// array; days left empty are dropped so the itinerary never shows a blank day.
import { eventAvailableOn } from '../../lib/favorites/build-route.ts';
import type { DayGroup, RouteStop } from '../../lib/favorites/build-route.ts';

export const dropEmptyDays = (groups: readonly DayGroup[]): readonly DayGroup[] =>
  groups.filter((g) => g.ids.length > 0);

export const removeStop = (groups: readonly DayGroup[], id: string, day: string): readonly DayGroup[] =>
  dropEmptyDays(groups.map((g) => (g.day === day ? { ...g, ids: g.ids.filter((x) => x !== id) } : g)));

export const reorderStop = (
  groups: readonly DayGroup[],
  id: string,
  day: string,
  delta: number,
): readonly DayGroup[] =>
  groups.map((g) => {
    if (g.day !== day) return g;
    const ids = [...g.ids];
    const i = ids.indexOf(id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= ids.length) return g;
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    return { ...g, ids };
  });

/** Move a stop to an absolute index within its day (the timeline drag-to-reorder
 *  commit). The index is clamped to the day's length after the stop is lifted
 *  out, so dropping past the end appends. */
export const moveStopToIndex = (
  groups: readonly DayGroup[],
  id: string,
  day: string,
  index: number,
): readonly DayGroup[] =>
  groups.map((g) => {
    if (g.day !== day) return g;
    const without = g.ids.filter((x) => x !== id);
    if (without.length === g.ids.length) return g; // id not on this day
    const at = Math.max(0, Math.min(Math.round(index), without.length));
    return { ...g, ids: [...without.slice(0, at), id, ...without.slice(at)] };
  });

export const moveStopToDay = (
  groups: readonly DayGroup[],
  id: string,
  from: string,
  to: string,
): readonly DayGroup[] =>
  dropEmptyDays(
    groups.map((g) => {
      if (g.day === from) return { ...g, ids: g.ids.filter((x) => x !== id) };
      if (g.day === to) return { ...g, ids: [...g.ids, id] };
      return g;
    }),
  );

export const addStopToDay = (groups: readonly DayGroup[], id: string, day: string): readonly DayGroup[] =>
  groups.map((g) => (g.day === day ? { ...g, ids: [...g.ids, id] } : g));

/** Other days in the route the event may move to — days it's available on
 *  (its span covers them), excluding the day it's already on. */
export const moveTargetDays = (
  groups: readonly DayGroup[],
  event: RouteStop,
  current: string,
): readonly string[] =>
  groups.map((g) => g.day).filter((day) => day !== current && eventAvailableOn(event, day));

/** Favourites that can be added to a given day: available that day, present in
 *  the corpus, and not already placed anywhere in the route. */
export const addableEvents = (
  groups: readonly DayGroup[],
  favourites: ReadonlySet<string>,
  byId: ReadonlyMap<string, RouteStop>,
  day: string,
): readonly RouteStop[] => {
  const placed = new Set(groups.flatMap((g) => g.ids));
  return [...favourites]
    .flatMap((id) => {
      const event = byId.get(id);
      return event ? [event] : [];
    })
    .filter((event) => !placed.has(event.id) && eventAvailableOn(event, day));
};
