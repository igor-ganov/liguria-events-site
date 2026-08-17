import { onTimelinePointerDown } from './on-timeline-pointer-down.ts';
import { onTimelinePointerMove } from './on-timeline-pointer-move.ts';
import { onTimelinePointerUp } from './on-timeline-pointer-up.ts';
import { resetDrag } from './reset-drag.ts';
import type { DragState, TimelineCommit, TimelineDrag, TimelineDragOptions } from './drag-types.ts';

/** Wire one timeline's drag gestures. The returned handlers are attached by the
 *  page; all the state a gesture needs lives in this closure. */
export const makeTimelineDrag = (
  commit: TimelineCommit,
  options: TimelineDragOptions = {},
): TimelineDrag => {
  const state: DragState = { gesture: 'pending', dragStart: 0, dragDur: 0, moveDy: 0, swipeDx: 0 };
  return {
    onPointerDown: (event) => onTimelinePointerDown(state, event),
    onPointerMove: (event) => onTimelinePointerMove(state, event),
    onPointerUp: () => onTimelinePointerUp(state, commit, options),
    onPointerCancel: () => resetDrag(state),
  };
};
