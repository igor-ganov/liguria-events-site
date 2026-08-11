// Shared vertical-timeline drag (the "Teams-calendar" interaction). A vertical
// drag REORDERS the stop: the block follows the finger and, on release, drops
// into a new slot in the day's sequence (insert above/below its neighbours) —
// there are no overlaps, so position is order. Dragging the bottom edge resizes
// (duration); a far-enough left swipe requests deletion. The block is mutated in
// place during the gesture so pointer capture survives; the commit reflows.
import { PX_PER_MIN } from './route-timeline.ts';
import { snapMinutes } from '../../lib/favorites/day-schedule.ts';

type Gesture = 'pending' | 'move' | 'resize' | 'swipe';

type Drag = Readonly<{ id: string; day: string; startX: number; startY: number; origDur: number; el: HTMLElement }>;

export type TimelineCommit = (
  commit:
    | Readonly<{ kind: 'reorder'; id: string; day: string; index: number }>
    | Readonly<{ kind: 'resize'; id: string; day: string; durMin: number }>,
) => void;

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

// The dragged block's target index in its day: how many OTHER blocks in the same
// axis have their centre above the dragged block's current (dragged) centre.
// Uses each block's absolute `top` (unaffected by the live translate), so it
// reads the true stacking order regardless of the transient transform.
const reorderIndex = (el: HTMLElement, dy: number): number => {
  const axis = el.closest('.tl-axis');
  if (!axis) return 0;
  const centre = (b: HTMLElement): number => (Number.parseFloat(b.style.top) || 0) + b.offsetHeight / 2;
  const dragged = centre(el) + dy;
  return [...axis.querySelectorAll<HTMLElement>('.tl-block')].filter((b) => b !== el && centre(b) < dragged).length;
};

export const makeTimelineDrag = (commit: TimelineCommit, options: TimelineDragOptions = {}): TimelineDrag => {
  let drag: Drag | undefined;
  let gesture: Gesture = 'pending';
  let dragDur = 0;
  let moveDy = 0;
  let swipeDx = 0;

  const onPointerDown = (event: PointerEvent): void => {
    const target = event.target instanceof Element ? event.target : undefined;
    const block = target?.closest<HTMLElement>('.tl-block');
    if (!block) return;
    if (target?.closest('[data-tl-del]')) return; // let the delete button's click through
    drag = {
      id: block.dataset['tlId'] ?? '',
      day: block.dataset['tlDay'] ?? '',
      startX: event.clientX,
      startY: event.clientY,
      origDur: Number(block.dataset['tlDur']),
      el: block,
    };
    gesture = target?.closest('[data-tl-resize]') ? 'resize' : 'pending';
    dragDur = drag.origDur;
    moveDy = 0;
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
    if (gesture === 'resize') {
      dragDur = Math.max(15, snapMinutes(drag.origDur + dy / PX_PER_MIN));
      drag.el.style.height = `${Math.max(20, dragDur * PX_PER_MIN)}px`;
    } else if (gesture === 'move') {
      moveDy = dy;
      drag.el.style.transform = `translateY(${dy}px)`;
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
    if (kind === 'resize') {
      finished.el.style.transform = '';
      commit({ kind: 'resize', id: finished.id, day: finished.day, durMin: dragDur });
      return;
    }
    if (kind === 'move') {
      const index = reorderIndex(finished.el, moveDy);
      finished.el.style.transform = '';
      commit({ kind: 'reorder', id: finished.id, day: finished.day, index });
    }
  };

  return { onPointerDown, onPointerMove, onPointerUp };
};
