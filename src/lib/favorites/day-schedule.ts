// Lay a day's stops onto a minute-of-day axis for the timeline view. Pure and
// unit-tested: given the stops in order plus the route's time/duration
// overrides, it produces each block's [start, end], the travel gap before it,
// and whether it overlaps its neighbour. The timeline renders from this; drag
// and resize just change the overrides and rebuild.
import type { CompactEvent } from '../events/event-schema.ts';
import { eventDuration } from './event-duration.ts';
import { travelMinutesBetween } from './build-route.ts';
import type { Mode } from './build-route.ts';

export type Times = Readonly<Record<string, string>>;
export type Durations = Readonly<Record<string, number>>;

export type ScheduledStop = Readonly<{
  id: string;
  startMin: number;
  endMin: number;
  /** Estimated travel minutes from the previous stop (0 for the first). */
  travelMin: number;
  overlap: boolean;
}>;

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const minutesOfTime = (t: string | undefined): number | undefined =>
  t !== undefined && TIME_RE.test(t) ? Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) : undefined;

export const timeOfMinutes = (m: number): string => {
  const clamped = ((Math.round(m) % 1440) + 1440) % 1440;
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`;
};

export const snapMinutes = (m: number, step = 15): number => Math.round(m / step) * step;

const coord = (event: CompactEvent): readonly [number, number] | undefined => event.g;

// A stop's fixed start: the route's time override wins, else the corpus time.
const fixedStart = (event: CompactEvent, times: Times): number | undefined =>
  minutesOfTime(times[event.id] ?? event.h);

/** Place a day's stops on the minute axis. Fixed times (override or corpus) are
 *  honoured; otherwise a stop auto-starts after the previous one plus travel. */
export const buildDaySchedule = (
  stops: readonly CompactEvent[],
  mode: Mode,
  times: Times,
  durations: Durations,
  dayStartMin: number,
): readonly ScheduledStop[] => {
  const placed: ScheduledStop[] = [];
  let prev: CompactEvent | undefined;
  let prevEnd = dayStartMin;
  for (const event of stops) {
    const from = prev ? coord(prev) : undefined;
    const to = coord(event);
    const travelMin = prev && from && to ? travelMinutesBetween(from, to, mode) : 0;
    const autoStart = prev ? prevEnd + travelMin : dayStartMin;
    const startMin = fixedStart(event, times) ?? autoStart;
    const endMin = startMin + eventDuration(event, durations[event.id]);
    placed.push({ id: event.id, startMin, endMin, travelMin, overlap: false });
    prev = event;
    prevEnd = endMin;
  }
  return placed.map((item, i) => {
    const clashesBefore = i > 0 && item.startMin < placed[i - 1]!.endMin;
    const clashesAfter = i < placed.length - 1 && placed[i + 1]!.startMin < item.endMin;
    return clashesBefore || clashesAfter ? { ...item, overlap: true } : item;
  });
};

/** Assign each block a lane (column) so overlapping blocks sit side-by-side and
 *  stay readable; disjoint blocks reuse the earliest free lane. Greedy interval
 *  partitioning — `count` is the max simultaneous blocks. */
export const assignLanes = (
  items: readonly ScheduledStop[],
): Readonly<{ lane: Readonly<Record<string, number>>; count: number }> => {
  const laneEnds: number[] = [];
  const lane: Record<string, number> = {};
  for (const item of [...items].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin)) {
    const free = laneEnds.findIndex((end) => end <= item.startMin);
    const l = free === -1 ? laneEnds.length : free;
    laneEnds[l] = item.endMin;
    lane[item.id] = l;
  }
  return { lane, count: Math.max(1, laneEnds.length) };
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
