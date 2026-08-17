import { blockCentre } from './block-centre.ts';
import { dragCommit } from './drag-commit.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { isDeleteSwipe } from './is-delete-swipe.ts';
import { reorderIndex } from './reorder-index.ts';
import { resetDrag } from './reset-drag.ts';
import { siblingCentres } from './sibling-centres.ts';
import type { Drag, DragState, TimelineCommit, TimelineDragOptions } from './drag-types.ts';

const release = (
  state: DragState,
  finished: Drag,
  commit: TimelineCommit,
  options: TimelineDragOptions,
): void => {
  const gesture = state.gesture;
  const swiped = state.swipeDx;
  const index = reorderIndex(
    siblingCentres(finished.axis, finished.el),
    blockCentre(finished.el) + state.moveDy,
  );
  resetDrag(state);
  dragCommit(gesture, {
    id: finished.id,
    day: finished.day,
    index,
    startMin: state.dragStart,
    durMin: state.dragDur,
  }).forEach(commit);
  [finished.id]
    .filter(() => gesture === 'swipe' && isDeleteSwipe(swiped))
    .forEach((id) => options.onSwipeDelete?.(id));
};

/** Shell: on release commit the time/duration (or request the deletion) and
 *  let the schedule reflow. */
export const onTimelinePointerUp = (
  state: DragState,
  commit: TimelineCommit,
  options: TimelineDragOptions,
): void => {
  [state.drag].filter(isDefined).forEach((finished) => release(state, finished, commit, options));
};
