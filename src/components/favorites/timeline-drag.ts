// Shared vertical-timeline drag/resize (the "Teams-calendar" interaction), plus
// a horizontal swipe-to-delete. The block is mutated in place during the gesture
// so pointer capture survives. On release: a vertical move/resize commits via
// `commit`; a far-enough left swipe requests deletion via `onSwipeDelete`.
import { PX_PER_MIN } from './route-timeline.ts';
import { snapMinutes, timeOfMinutes } from '../../lib/favorites/day-schedule.ts';

type Gesture = 'pending' | 'move' | 'resize' | 'swipe';

type Drag = Readonly<{ id: string; startX: number; startY: number; origTop: number; origStart: number; origDur: number; el: HTMLElement }>;

export type TimelineCommit = (id: string, kind: 'move' | 'resize', startMin: number, durMin: number) => void;

export interface TimelineDragOptions {
  /** Called when a block is swiped far enough left to request deletion. */
  readonly onSwipeDelete?: (id: string) => void;
}

export interface TimelineDrag {
  readonly onPointerDown: (event: PointerEvent) => void;
  readonly onPointerMove: (event: PointerEvent) => void;
  readonly onPointerUp: () => void;
}

const AXIS_MIN = 6; // px before a gesture's axis is decided
const SWIPE_TRIGGER = 90; // px left-swipe that requests deletion

export const makeTimelineDrag = (commit: TimelineCommit, options: TimelineDragOptions = {}): TimelineDrag => {
  let drag: Drag | undefined;
  let gesture: Gesture = 'pending';
  let dragStart = 0;
  let dragDur = 0;
  let swipeDx = 0;

  const setLabel = (el: HTMLElement, startMin: number, durMin: number): void => {
    const label = el.querySelector('.tl-time');
    if (label) label.textContent = `${timeOfMinutes(startMin)}–${timeOfMinutes(startMin + durMin)}`;
  };

  const onPointerDown = (event: PointerEvent): void => {
    const target = event.target instanceof Element ? event.target : undefined;
    const block = target?.closest<HTMLElement>('.tl-block');
    if (!block) return;
    if (target?.closest('[data-tl-del]')) return; // let the delete button's click through
    const origStart = Number(block.dataset['tlStart']);
    const origDur = Number(block.dataset['tlDur']);
    drag = { id: block.dataset['tlId'] ?? '', startX: event.clientX, startY: event.clientY, origTop: Number.parseFloat(block.style.top) || 0, origStart, origDur, el: block };
    gesture = target?.closest('[data-tl-resize]') ? 'resize' : 'pending';
    dragStart = origStart;
    dragDur = origDur;
    swipeDx = 0;
    // setPointerCapture can throw if the pointer is already gone — ignore.
    try {
      block.setPointerCapture(event.pointerId);
    } catch {
      /* no active pointer — the document listeners still track the gesture */
    }
    block.classList.add('tl-block--dragging');
    event.preventDefault();
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (gesture === 'pending') {
      if (Math.abs(dx) > AXIS_MIN && Math.abs(dx) > Math.abs(dy)) gesture = 'swipe';
      else if (Math.abs(dy) > AXIS_MIN) gesture = 'move';
    }
    if (gesture === 'swipe') {
      swipeDx = Math.min(0, dx);
      drag.el.style.transform = `translateX(${swipeDx}px)`;
      drag.el.classList.toggle('tl-block--will-delete', swipeDx < -SWIPE_TRIGGER);
      return;
    }
    const deltaMin = dy / PX_PER_MIN;
    if (gesture === 'resize') {
      dragDur = Math.max(15, snapMinutes(drag.origDur + deltaMin));
      drag.el.style.height = `${Math.max(20, dragDur * PX_PER_MIN)}px`;
      setLabel(drag.el, dragStart, dragDur);
    } else if (gesture === 'move') {
      dragStart = Math.max(0, snapMinutes(drag.origStart + deltaMin));
      drag.el.style.top = `${drag.origTop + (dragStart - drag.origStart) * PX_PER_MIN}px`;
      setLabel(drag.el, dragStart, dragDur);
    }
  };

  const onPointerUp = (): void => {
    if (!drag) return;
    const finished = drag;
    const kind = gesture;
    drag = undefined;
    finished.el.classList.remove('tl-block--dragging');
    if (kind === 'swipe') {
      finished.el.style.transform = '';
      finished.el.classList.remove('tl-block--will-delete');
      if (swipeDx < -SWIPE_TRIGGER) options.onSwipeDelete?.(finished.id);
      return;
    }
    if (kind === 'move' || kind === 'resize') commit(finished.id, kind, dragStart, dragDur);
  };

  return { onPointerDown, onPointerMove, onPointerUp };
};
