// Shared vertical-timeline drag (the "Teams-calendar" interaction). The block
// BODY stays scrollable (touch-action: pan-y) so the page still scrolls under a
// finger; you MOVE a block by its grip, RESIZE from the top/bottom edges, and
// DELETE with a left swipe. On release the time/duration is committed and the
// schedule reflows. On a mouse, dragging the body also moves (no scroll to
// lose). This module is the stable import surface; the geometry lives in pure
// functions and the DOM writes in thin shells, one per file next to it.
export type { DragCommit, Gesture, TimelineCommit, TimelineDrag, TimelineDragOptions } from './drag-types.ts';
export { makeTimelineDrag } from './make-timeline-drag.ts';
