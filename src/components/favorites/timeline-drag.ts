// Shared vertical-timeline drag (the "Teams-calendar" interaction). The block
// BODY stays scrollable (touch-action: pan-y) so the page still scrolls under a
// finger; you MOVE a block by its grip, RESIZE from the top/bottom edges, and
// DELETE with a left swipe. On release the time/duration is committed and the
// schedule reflows. On a mouse, dragging the body also moves (no scroll to lose).
import { PX_PER_MIN } from './route-timeline.ts';
import { snapMinutes } from '../../lib/favorites/day-schedule.ts';

type Gesture = 'pending' | 'move' | 'resize-top' | 'resize-bottom' | 'swipe';

type Drag = Readonly<{
  id: string;
  day: string;
  startX: number;
  startY: number;
  origStart: number;
  origDur: number;
  origTop: number;
  el: HTMLElement;
  axis: HTMLElement;
  oi: number;
  mouse: boolean;
}>;

export type TimelineCommit = (
  commit:
    | Readonly<{ kind: 'move'; id: string; day: string; index: number; startMin: number }>
    | Readonly<{ kind: 'resize'; id: string; day: string; durMin: number }>
    | Readonly<{ kind: 'resize-top'; id: string; day: string; startMin: number; durMin: number }>,
) => void;

export interface TimelineDragOptions {
  /** Called when a block is swiped far enough left to request deletion. */
  readonly onSwipeDelete?: (id: string) => void;
}

export interface TimelineDrag {
  readonly onPointerDown: (event: PointerEvent) => void;
  readonly onPointerMove: (event: PointerEvent) => void;
  readonly onPointerUp: () => void;
  readonly onPointerCancel: () => void;
}

const AXIS_MIN = 6; // px before a gesture's axis is decided
const SWIPE_TRIGGER = 90; // px left-swipe that requests deletion
const MIN_DUR = 15; // shortest a block can be shrunk to

const siblings = (axis: HTMLElement): readonly HTMLElement[] => [...axis.querySelectorAll<HTMLElement>('.tl-block')];

const centre = (b: HTMLElement): number => (Number.parseFloat(b.style.top) || 0) + b.offsetHeight / 2;

const reorderIndex = (drag: Drag, dy: number): number => {
  const dragged = centre(drag.el) + dy;
  return siblings(drag.axis).filter((b) => b !== drag.el && centre(b) < dragged).length;
};

// Slide the neighbours between the block's slot and its target to open the gap.
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
};

export const makeTimelineDrag = (commit: TimelineCommit, options: TimelineDragOptions = {}): TimelineDrag => {
  let drag: Drag | undefined;
  let gesture: Gesture = 'pending';
  let dragStart = 0;
  let dragDur = 0;
  let moveDy = 0;
  let swipeDx = 0;

  const onPointerDown = (event: PointerEvent): void => {
    const target = event.target instanceof Element ? event.target : undefined;
    const block = target?.closest<HTMLElement>('.tl-block');
    if (!block) return;
    if (target?.closest('button')) return; // let the ✕/＋ buttons take their own clicks
    const axis = block.closest<HTMLElement>('.tl-axis') ?? block;
    drag = {
      id: block.dataset['tlId'] ?? '',
      day: block.dataset['tlDay'] ?? '',
      startX: event.clientX,
      startY: event.clientY,
      origStart: Number(block.dataset['tlStart']),
      origDur: Number(block.dataset['tlDur']),
      origTop: Number.parseFloat(block.style.top) || 0,
      el: block,
      axis,
      oi: siblings(axis).indexOf(block),
      mouse: event.pointerType === 'mouse',
    };
    const handle = target?.closest<HTMLElement>('[data-tl-resize]');
    const grip = target?.closest('[data-tl-grip]');
    gesture = handle ? (handle.dataset['tlResize'] === 'top' ? 'resize-top' : 'resize-bottom') : grip ? 'move' : 'pending';
    dragStart = drag.origStart;
    dragDur = drag.origDur;
    moveDy = 0;
    swipeDx = 0;
    try {
      block.setPointerCapture(event.pointerId);
    } catch {
      /* no active pointer — the document listeners still track the gesture */
    }
    block.classList.add('tl-block--dragging');
    // Only claim the touch (block scrolling) for a deliberate move/resize; leave
    // the body free so a vertical swipe scrolls the page.
    if (gesture !== 'pending') event.preventDefault();
  };

  const onPointerMove = (event: PointerEvent): void => {
    const d = drag;
    if (!d) return;
    const dx = event.clientX - d.startX;
    const dy = event.clientY - d.startY;
    if (gesture === 'pending') {
      // Horizontal → swipe-to-delete. Vertical on the body → a move only with a
      // mouse; on touch the browser scrolls (pan-y) so we don't hijack it.
      if (Math.abs(dx) > AXIS_MIN && Math.abs(dx) > Math.abs(dy)) gesture = 'swipe';
      else if (d.mouse && Math.abs(dy) > AXIS_MIN) gesture = 'move';
      else return;
      event.preventDefault();
    }
    if (gesture === 'swipe') {
      swipeDx = Math.min(0, dx);
      d.el.style.transform = `translateX(${swipeDx}px)`;
      d.el.classList.toggle('tl-block--will-delete', swipeDx < -SWIPE_TRIGGER);
      return;
    }
    if (gesture === 'resize-bottom') {
      dragDur = Math.max(MIN_DUR, snapMinutes(d.origDur + dy / PX_PER_MIN));
      d.el.style.height = `${Math.max(20, dragDur * PX_PER_MIN)}px`;
    } else if (gesture === 'resize-top') {
      dragStart = snapMinutes(Math.min(d.origStart + dy / PX_PER_MIN, d.origStart + d.origDur - MIN_DUR));
      dragDur = d.origStart + d.origDur - dragStart;
      d.el.style.top = `${d.origTop + (dragStart - d.origStart) * PX_PER_MIN}px`;
      d.el.style.height = `${Math.max(20, dragDur * PX_PER_MIN)}px`;
    } else if (gesture === 'move') {
      moveDy = dy;
      dragStart = Math.max(0, snapMinutes(d.origStart + dy / PX_PER_MIN));
      d.el.style.transform = `translateY(${dy}px)`;
      d.axis.classList.add('tl-axis--dragging');
      previewShift(d, reorderIndex(d, dy));
    }
  };

  const reset = (): void => {
    const finished = drag;
    if (!finished) return;
    drag = undefined;
    finished.el.classList.remove('tl-block--dragging', 'tl-block--will-delete');
    clearPreview(finished);
    finished.el.style.transform = '';
  };

  const onPointerUp = (): void => {
    const finished = drag;
    if (!finished) return;
    const kind = gesture;
    const index = kind === 'move' ? reorderIndex(finished, moveDy) : 0;
    reset();
    if (kind === 'swipe') {
      if (swipeDx < -SWIPE_TRIGGER) options.onSwipeDelete?.(finished.id);
    } else if (kind === 'resize-bottom') {
      commit({ kind: 'resize', id: finished.id, day: finished.day, durMin: dragDur });
    } else if (kind === 'resize-top') {
      commit({ kind: 'resize-top', id: finished.id, day: finished.day, startMin: dragStart, durMin: dragDur });
    } else if (kind === 'move') {
      commit({ kind: 'move', id: finished.id, day: finished.day, index, startMin: dragStart });
    }
  };

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: reset };
};
