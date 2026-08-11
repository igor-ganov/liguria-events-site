import { buildDaySchedule, timeOfMinutes } from './day-schedule.ts';
import type { Durations, Times } from './day-schedule.ts';
import { eventDuration } from './event-duration.ts';
import type { Mode, RouteStop } from './build-route.ts';

const MIN_DUR = 15;

// After pinning `movedId` to `newStart`, resolve ONLY the immediately-following
// stop so it no longer overlaps the moved one: place it right after (if it fits
// whole before the stop after it, or the day's end), else right before (if it
// fits after the preceding stop), else shrink it into the after-gap. Returns the
// updated times/durations; the render reflows from them.
export const resolveNext = (
  stops: readonly RouteStop[],
  mode: Mode,
  times: Times,
  durations: Durations,
  pauses: Durations,
  dayStartMin: number,
  dayEndMin: number,
  movedId: string,
  newStart: number,
): Readonly<{ times: Times; durations: Durations }> => {
  const times2: Record<string, string> = { ...times, [movedId]: timeOfMinutes(newStart) };
  const durations2: Record<string, number> = { ...durations };
  const sched = buildDaySchedule(stops, mode, times2, durations2, pauses, dayStartMin);
  const i = sched.findIndex((s) => s.id === movedId);
  const a = sched[i];
  const b = sched[i + 1];
  const bStop = stops[i + 1];
  if (!a || !b || !bStop || b.startMin >= a.endMin) return { times: times2, durations: durations2 }; // no overlap

  const durB = eventDuration(bStop, durations2[b.id]);
  const travelAB = b.travelMin;
  const afterStart = a.endMin + travelAB;
  const afterLimit = sched[i + 2]?.startMin ?? dayEndMin; // fit before the stop after B / day end
  if (afterStart + durB <= afterLimit) {
    times2[b.id] = timeOfMinutes(afterStart);
    return { times: times2, durations: durations2 };
  }

  const beforeStart = a.startMin - travelAB - durB;
  const prevEnd = sched[i - 1]?.endMin ?? dayStartMin;
  if (beforeStart >= prevEnd && beforeStart >= dayStartMin) {
    times2[b.id] = timeOfMinutes(beforeStart);
    return { times: times2, durations: durations2 };
  }

  // Nowhere to move it whole — shrink it into whatever the after-gap allows.
  times2[b.id] = timeOfMinutes(afterStart);
  durations2[b.id] = Math.max(MIN_DUR, afterLimit - afterStart);
  return { times: times2, durations: durations2 };
};
