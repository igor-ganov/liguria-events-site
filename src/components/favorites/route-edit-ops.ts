// Pure operations on a route's day groups — the semantics of the owner editor,
// kept free of the DOM so they can be unit-tested. Each returns a new groups
// array; days left empty are dropped so the itinerary never shows a blank day.
// This module is the stable import surface; every operation lives one function
// per file next to it and is unit-tested on its own.
export { dropEmptyDays } from './drop-empty-days.ts';
export { removeStop } from './remove-stop.ts';
export { reorderStop } from './reorder-stop.ts';
export { moveStopToIndex } from './move-stop-to-index.ts';
export { moveStopToDay } from './move-stop-to-day.ts';
export { addStopToDay } from './add-stop-to-day.ts';
export { moveTargetDays } from './move-target-days.ts';
export { addableEvents } from './addable-events.ts';
