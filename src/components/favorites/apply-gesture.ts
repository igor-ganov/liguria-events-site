import { PX_PER_MIN } from './px-per-min.ts';
import { blockPx } from './block-px.ts';
import { isDeleteSwipe } from './is-delete-swipe.ts';
import { moveStartMin } from './move-start-min.ts';
import { resizeTopWindow } from './resize-top-window.ts';
import { snapDuration } from './snap-duration.ts';
import { swipeOffset } from './swipe-offset.ts';
import type { Drag, DragState, Gesture } from './drag-types.ts';

type Apply = (state: DragState, drag: Drag, dx: number, dy: number) => void;

const BY_GESTURE: Readonly<Record<Gesture, Apply>> = {
  pending: () => {},
  swipe: (state, drag, dx) => {
    state.swipeDx = swipeOffset(dx);
    drag.el.style.transform = `translateX(${state.swipeDx}px)`;
    drag.el.classList.toggle('tl-block--will-delete', isDeleteSwipe(state.swipeDx));
  },
  'resize-bottom': (state, drag, _dx, dy) => {
    state.dragDur = snapDuration(drag.origDur, dy);
    drag.el.style.height = `${blockPx(state.dragDur)}px`;
  },
  'resize-top': (state, drag, _dx, dy) => {
    const next = resizeTopWindow(drag.origStart, drag.origDur, dy);
    state.dragStart = next.startMin;
    state.dragDur = next.durMin;
    drag.el.style.top = `${drag.origTop + (next.startMin - drag.origStart) * PX_PER_MIN}px`;
    drag.el.style.height = `${blockPx(next.durMin)}px`;
  },
  // The dragged block floats with the finger; neighbours stay put and the
  // reorder is applied cleanly on release (a live shift only ghosted).
  move: (state, drag, _dx, dy) => {
    state.moveDy = dy;
    state.dragStart = moveStartMin(drag.origStart, dy);
    drag.el.style.transform = `translateY(${dy}px)`;
    drag.axis.classList.add('tl-axis--dragging');
  },
};

/** Shell: show the gesture in progress and record what it would commit. */
export const applyGesture = (state: DragState, drag: Drag, dx: number, dy: number): void =>
  BY_GESTURE[state.gesture](state, drag, dx, dy);
