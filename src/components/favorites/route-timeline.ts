// Renders the day timeline (vertical clock axis) from the pure day-schedule
// model. This module is the stable import surface; every markup builder and
// every axis calculation lives one function per file next to it and is
// unit-tested on its own.
export type { DayBounds, DayCtx, TimelineOpts } from './timeline-types.ts';
export { PX_PER_MIN } from './px-per-min.ts';
export { DAY_START_MIN } from './day-start-min.ts';
export { renderTimeline } from './render-timeline.ts';
