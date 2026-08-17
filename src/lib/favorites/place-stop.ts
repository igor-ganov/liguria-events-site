// One step of the day layout: where the next stop lands, given where the walk
// left off. Pure — the whole schedule is this folded over the day's sequence.
import { travelMinutesBetween } from './build-route.ts';
import { eventDuration } from './event-duration.ts';
import { minutesOfTime } from './minutes-of-time.ts';
import { officialWindow } from './official-window.ts';
import type { Mode, RouteStop } from './build-route.ts';
import type { Durations, ScheduledStop, Times } from './day-schedule-types.ts';

type Coord = readonly [number, number];

/** What the layout carries from one stop to the next. `lastCoord` is the last
 *  stop that HAD a location, so a break doesn't zero out the journey. */
export type Placement = Readonly<{
  placed: readonly ScheduledStop[];
  prev?: RouteStop | undefined;
  prevEnd: number;
  lastCoord?: Coord | undefined;
}>;

export type Plan = Readonly<{ mode: Mode; times: Times; durations: Durations; pauses: Durations }>;

const travelOf = (from: Coord | undefined, to: Coord | undefined, mode: Mode): number =>
  (from && to && travelMinutesBetween(from, to, mode)) || 0;

const outside = (start: number, end: number, event: RouteStop): boolean => {
  const win = officialWindow(event);
  return win !== undefined && (start < win.start || end > win.end);
};

export const placeStop =
  (plan: Plan) =>
  (state: Placement, event: RouteStop): Placement => {
    const to = event.g;
    const travelMin = travelOf(state.lastCoord, to, plan.mode);
    // A break waited AFTER the previous stop; the first stop pays neither.
    const flow = state.prevEnd + travelMin + ((state.prev && plan.pauses[state.prev.id]) ?? 0);
    // A pin is a MINIMUM start, not an absolute one: an event can be pushed later
    // (a gap opens before it) but never earlier than it can be reached — so it can
    // never land on top of the previous stop. No overlaps, ever.
    const startMin = Math.max(minutesOfTime(plan.times[event.id]) ?? flow, flow);
    const endMin = startMin + eventDuration(event, plan.durations[event.id]);
    const stop = { id: event.id, startMin, endMin, travelMin, offSchedule: outside(startMin, endMin, event) };
    return { placed: [...state.placed, stop], prev: event, prevEnd: endMin, lastCoord: to ?? state.lastCoord };
  };
