import { branch } from '../../lib/branch.ts';
import { eventDuration } from '../../lib/favorites/event-duration.ts';
import type { Durations } from '../../lib/favorites/day-schedule.ts';
import type { RouteStop } from '../../lib/favorites/build-route.ts';

const MIN_DUR = 15; // no stop is shrunk below this
type Steal = Readonly<{ durations: Readonly<Record<string, number>>; extra: number }>;

const shortened = (id: string, left: number, take: number): Readonly<Record<string, number>> =>
  branch(take > 0)<Readonly<Record<string, number>>>(() => ({ [id]: left - take }), () => ({}));

// Take what is still owed off the next stop, never past its 15-minute floor.
const takeFrom = (acc: Steal, stop: RouteStop): Steal => {
  const left = eventDuration(stop, acc.durations[stop.id]);
  const take = Math.max(0, Math.min(acc.extra, left - MIN_DUR));
  return { durations: { ...acc.durations, ...shortened(stop.id, left, take) }, extra: acc.extra - take };
};

const stealAfter = (
  stops: readonly RouteStop[],
  target: RouteStop,
  newDur: number,
  durations: Durations,
): Readonly<Record<string, number>> =>
  stops
    .slice(stops.indexOf(target) + 1)
    .reduce(takeFrom, {
      durations: { ...durations, [target.id]: newDur },
      extra: newDur - eventDuration(target, durations[target.id]),
    }).durations;

/** Growing a stop steals minutes from the stops that FOLLOW it (they shrink to
 *  make room rather than being shoved later); shrinking just sets it and the
 *  rest of the day flows up. Undefined when the day does not hold that stop. */
export const stealDurations = (
  stops: readonly RouteStop[],
  id: string,
  newDur: number,
  durations: Durations,
): Readonly<Record<string, number>> | undefined =>
  stops
    .filter((stop) => stop.id === id)
    .slice(0, 1)
    .map((target) => stealAfter(stops, target, newDur, durations))
    .at(0);
