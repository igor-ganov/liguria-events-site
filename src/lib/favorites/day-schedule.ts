// The day timeline, split one function per file. This module is the entry point
// the route UI imports; each part lives next to it and is unit-tested on its own.
// A stop with a fixed official time turns "off-schedule" when the sequence
// places its block outside the event's real window.
export type { Durations, ScheduledStop, Times } from './day-schedule-types.ts';
export { buildDaySchedule } from './build-day-schedule.ts';
export { minutesOfTime } from './minutes-of-time.ts';
export { timeOfMinutes } from './time-of-minutes.ts';
export { snapMinutes } from './snap-minutes.ts';
export { officialWindow } from './official-window.ts';
export { axisRange } from './axis-range.ts';
