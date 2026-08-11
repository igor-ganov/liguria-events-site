// Shared vertical-timeline drag (the "Teams-calendar" interaction). A vertical
// drag REORDERS the stop: the block follows the finger and its NEIGHBOURS glide
// aside live to open the drop slot, so you see where it lands before releasing.
// On release the day's sequence is committed and the times reflow. Dragging the
// bottom edge resizes (duration); a far-enough left swipe requests deletion. The
// block is mutated in place during the gesture so pointer capture survives.
import { PX_PER_MIN } from './route-timeline.ts';
import { snapMinutes } from '../../lib/favorites/day-schedule.ts';

type Gesture = 'pending' | 'move' | 'resize' | 'swipe';

type Drag = Readonly<{
  id: string;
  day: string;
  startX: number;
  startY: number;
  origDur: number;
  el: HTMLElement;
  axis: HTMLElement;
  /** The block's index among its axis siblings at grab time. */
  oi: number;
}>;

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

const siblings = (axis: HTMLElement): readonly HTMLElement[] => [...axis.querySelectorAll<HTMLElement>('.tl-block')];

const centre = (b: HTMLElement): number => (Number.parseFloat(b.style.top) || 0) + b.offsetHeight / 2;

// The dragged block's target index in its day: how many OTHER blocks have their
// centre above the dragged block's current (dragged) centre. Uses each block's
// absolute `top`, unaffected by the live translate, so it reads the true order.
const reorderIndex = (drag: Drag, dy: number): number => {
  const dragged = centre(drag.el) + dy;
  return siblings(drag.axis).filter((b) => b !== drag.el && centre(b) < dragged).length;
};

// Slide the neighbours between the block's original slot and its target slot to
// open the gap where it will drop. Approximate (one block-height per step) — the
// exact reflow happens on release; this is the affordance.
const previewShift = (drag: Drag, ti: number): void => {
  const shift = drag.el.offsetHeight;
  siblings(drag.axis).forEach((b, i) => {
    if (b === drag.el) return;
    const ty = ti > drag.oi && i > drag.oi && i <= ti ? -shift : ti < drag.oi && i >= ti && i < drag.oi ? shift : 0;
    b.style.transform = ty ? `translateY(${ty}px)` : '';
  });
};

const clearPreview = (drag: Drag): void => {
  drag.axis.classList.remove('tl-axis--dragging');
  siblings(drag.axis).forEach((b) => {
    if (b !== drag.el) b.style.transform = '';
  });
  drag.el.style.transform = '';
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
    const axis = block.closest<HTMLElement>('.tl-axis') ?? block;
    drag = {
      id: block.dataset['tlId'] ?? '',
      day: block.dataset['tlDay'] ?? '',
      startX: event.clientX,
      startY: event.clientY,
      origDur: Number(block.dataset['tlDur']),
      el: block,
      axis,
      oi: siblings(axis).indexOf(block),
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
    const d = drag;
    if (!d) return;
    const dx = event.clientX - d.startX;
    const dy = event.clientY - d.startY;
    if (gesture === 'pending') {
      if (Math.abs(dx) > AXIS_MIN && Math.abs(dx) > Math.abs(dy)) gesture = 'swipe';
      else if (Math.abs(dy) > AXIS_MIN) gesture = 'move';
    }
    if (gesture === 'swipe') {
      swipeDx = Math.min(0, dx);
      d.el.style.transform = `translateX(${swipeDx}px)`;
      d.el.classList.toggle('tl-block--will-delete', swipeDx < -SWIPE_TRIGGER);
      return;
    }
    if (gesture === 'resize') {
      dragDur = Math.max(15, snapMinutes(d.origDur + dy / PX_PER_MIN));
      d.el.style.height = `${Math.max(20, dragDur * PX_PER_MIN)}px`;
    } else if (gesture === 'move') {
      moveDy = dy;
      d.el.style.transform = `translateY(${dy}px)`;
      d.axis.classList.add('tl-axis--dragging');
      previewShift(d, reorderIndex(d, dy));
    }
  };

  const onPointerUp = (): void => {
    const finished = drag;
    if (!finished) return;
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
      const index = reorderIndex(finished, moveDy);
      clearPreview(finished);
      commit({ kind: 'reorder', id: finished.id, day: finished.day, index });
    }
  };

  return { onPointerDown, onPointerMove, onPointerUp };
};
