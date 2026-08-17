import { initialGesture } from './initial-gesture.ts';
import { isDefined } from '../../lib/is-defined.ts';
import type { Drag, DragState } from './drag-types.ts';

const capture = (block: HTMLElement, pointerId: number): void => {
  try {
    block.setPointerCapture(pointerId);
  } catch {
    /* no active pointer — the document listeners still track the gesture */
  }
};

const edgeOf = (target: Element | undefined): string | undefined =>
  [target?.closest<HTMLElement>('[data-tl-resize]') ?? undefined]
    .filter(isDefined)
    .map((handle) => handle.dataset['tlResize'] ?? '')
    .at(0);

const dragOf = (block: HTMLElement, event: PointerEvent): Drag => ({
  id: block.dataset['tlId'] ?? '',
  day: block.dataset['tlDay'] ?? '',
  startX: event.clientX,
  startY: event.clientY,
  origStart: Number(block.dataset['tlStart']),
  origDur: Number(block.dataset['tlDur']),
  origTop: Number.parseFloat(block.style.top) || 0,
  el: block,
  axis: block.closest<HTMLElement>('.tl-axis') ?? block,
  mouse: event.pointerType === 'mouse',
});

/** Shell: take hold of a block. Only a deliberate move/resize claims the touch
 *  (blocking scroll); a plain body press leaves the page free to scroll. */
export const beginDrag = (
  state: DragState,
  block: HTMLElement,
  target: Element | undefined,
  event: PointerEvent,
): void => {
  const drag = dragOf(block, event);
  state.drag = drag;
  state.gesture = initialGesture(edgeOf(target), Boolean(target?.closest('[data-tl-grip]')));
  state.dragStart = drag.origStart;
  state.dragDur = drag.origDur;
  state.moveDy = 0;
  state.swipeDx = 0;
  capture(block, event.pointerId);
  block.classList.add('tl-block--dragging');
  [event].filter(() => state.gesture !== 'pending').forEach((claimed) => claimed.preventDefault());
};
