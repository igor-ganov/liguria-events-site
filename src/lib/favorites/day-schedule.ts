// Lay a day's stops onto a minute-of-day axis for the timeline view. Pure and
// unit-tested. The stops are a strict SEQUENCE (their list order): the first
// starts at the day's opening, each next one after the previous plus travel.
// There are no overlaps and no lanes — dragging reorders the sequence, which
// reflows the times. A stop with a fixed official time turns "off-schedule"
// when the sequence places its block outside the event's real window.
import { eventDuration } from './event-duration.ts';
import { travelMinutesBetween } from './build-route.ts';
import type { Mode, RouteStop } from './build-route.ts';

export type Durations = Readonly<Record<string, number>>;
// Kept for the payload schema (legacy routes carry per-stop start times); the
// sequence model no longer uses them for positioning.
export type Times = Readonly<Record<string, string>>;

export type ScheduledStop = Readonly<{
  id: string;
  startMin: number;
  endMin: number;
  /** Estimated travel minutes from the previous stop (0 for the first). */
  travelMin: number;
  /** The scheduled block falls outside the event's official window — placed
   *  before it opens, or running past its close. Stops without a fixed time
   *  (POIs/landmarks) are flexible and never off-schedule. */
  offSchedule: boolean;
}>;

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const minutesOfTime = (t: string | undefined): number | undefined =>
  t !== undefined && TIME_RE.test(t) ? Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) : undefined;

export const timeOfMinutes = (m: number): string => {
  const clamped = ((Math.round(m) % 1440) + 1440) % 1440;
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`;
};

export const snapMinutes = (m: number, step = 15): number => Math.round(m / step) * step;

const coord = (event: RouteStop): readonly [number, number] | undefined => event.g;

// The event's official window: when it actually runs. Start from the corpus
// time; length is the source-stated duration or the category default — NOT the
// visitor's override, since an over-long visit is exactly what may overrun the
// close. Undefined for stops with no fixed time (they are always flexible).
export const officialWindow = (event: RouteStop): Readonly<{ start: number; end: number }> | undefined => {
  const start = minutesOfTime(event.h);
  return start === undefined ? undefined : { start, end: start + eventDuration(event) };
};

/** Place a day's stops on the minute axis as a strict sequence: the order is
 *  the itinerary. The first stop opens the day; each next one follows the
 *  previous plus travel. `offSchedule` flags a fixed-time stop whose resulting
 *  block sticks out of the event's official window. */
export const buildDaySchedule = (
  stops: readonly RouteStop[],
  mode: Mode,
  durations: Durations,
  dayStartMin: number,
): readonly ScheduledStop[] => {
  const placed: ScheduledStop[] = [];
  let prev: RouteStop | undefined;
  let prevEnd = dayStartMin;
  for (const event of stops) {
    const from = prev ? coord(prev) : undefined;
    const to = coord(event);
    const travelMin = prev && from && to ? travelMinutesBetween(from, to, mode) : 0;
    const startMin = prev ? prevEnd + travelMin : dayStartMin;
    const endMin = startMin + eventDuration(event, durations[event.id]);
    const win = officialWindow(event);
    const offSchedule = win !== undefined && (startMin < win.start || endMin > win.end);
    placed.push({ id: event.id, startMin, endMin, travelMin, offSchedule });
    prev = event;
    prevEnd = endMin;
  }
  return placed;
};

/** The visible time window: whole hours spanning the day start and every block,
 *  at least an hour tall. */
export const axisRange = (
  items: readonly ScheduledStop[],
  dayStartMin: number,
): Readonly<{ start: number; end: number }> => {
  if (items.length === 0) return { start: dayStartMin, end: dayStartMin + 120 };
  const start = Math.floor(Math.min(dayStartMin, ...items.map((i) => i.startMin)) / 60) * 60;
  const end = Math.ceil(Math.max(...items.map((i) => i.endMin)) / 60) * 60;
  return { start, end: Math.max(end, start + 60) };
};
