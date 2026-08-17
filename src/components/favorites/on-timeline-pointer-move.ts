import { applyGesture } from './apply-gesture.ts';
import { decideGesture } from './decide-gesture.ts';
import { isDefined } from '../../lib/is-defined.ts';
import type { Drag, DragState } from './drag-types.ts';

// The touch is claimed at the moment the axis is decided, not on every move.
const track = (state: DragState, drag: Drag, event: PointerEvent): void => {
  const dx = event.clientX - drag.startX;
  const dy = event.clientY - drag.startY;
  const before = state.gesture;
  state.gesture = decideGesture(before, dx, dy, drag.mouse);
  [event]
    .filter(() => before === 'pending' && state.gesture !== 'pending')
    .forEach((claimed) => claimed.preventDefault());
  applyGesture(state, drag, dx, dy);
};

/** Shell: follow the pointer, deciding the gesture on its first real travel. */
export const onTimelinePointerMove = (state: DragState, event: PointerEvent): void => {
  [state.drag].filter(isDefined).forEach((drag) => track(state, drag, event));
};
