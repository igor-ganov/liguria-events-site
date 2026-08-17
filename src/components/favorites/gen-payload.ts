import type { DayHours } from '../../lib/favorites/day-hours.ts';
import type { Durations, Times } from '../../lib/favorites/day-schedule.ts';
import type { Mode } from '../../lib/favorites/build-route.ts';
import type { Payload } from './route-payload.ts';

export type PayloadSource = Readonly<{
  mode: Mode;
  durations: Durations;
  times: Times;
  pauses: Durations;
  dayHours: Readonly<Record<string, DayHours>>;
}>;

/** A payload shim, so the shared timeline renderer works for a route that has
 *  not been saved yet: the arrangement is real, everything a SAVED route adds
 *  (embedded POIs, route-level window, bases) is empty. */
export const genPayload = (state: PayloadSource): Payload => ({
  mode: state.mode,
  groups: [],
  durations: state.durations,
  times: state.times,
  pauses: state.pauses,
  pois: {},
  dayStart: '',
  dayEnd: '',
  dayHours: state.dayHours,
  base: undefined,
  dayBases: {},
  dayFinals: {},
});
