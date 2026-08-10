// Shared vertical-timeline drag/resize (the "Teams-calendar" interaction),
// used by both the saved-route editor and the favourites generator. The block
// is mutated in place during the gesture so pointer capture survives; the
// commit callback fires once on release with the snapped start/duration.
import { PX_PER_MIN } from './route-timeline.ts';
import { snapMinutes, timeOfMinutes } from '../../lib/favorites/day-schedule.ts';

type Drag = Readonly<{
  id: string;
  kind: 'move' | 'resize';
  startY: number;
  origTop: number;
  origStart: number;
  origDur: number;
  el: HTMLElement;
}>;

export type TimelineCommit = (id: string, kind: 'move' | 'resize', startMin: number, durMin: number) => void;

export interface TimelineDrag {
  readonly onPointerDown: (event: PointerEvent) => void;
  readonly onPointerMove: (event: PointerEvent) => void;
  readonly onPointerUp: () => void;
}

export const makeTimelineDrag = (commit: TimelineCommit): TimelineDrag => {
  let drag: Drag | undefined;
  let dragStart = 0;
  let dragDur = 0;

  const setLabel = (el: HTMLElement, startMin: number, durMin: number): void => {
    const label = el.querySelector('.tl-time');
    if (label) label.textContent = `${timeOfMinutes(startMin)}–${timeOfMinutes(startMin + durMin)}`;
  };

  const onPointerDown = (event: PointerEvent): void => {
    const target = event.target instanceof Element ? event.target : undefined;
    const block = target?.closest<HTMLElement>('.tl-block');
    if (!block) return;
    const origStart = Number(block.dataset['tlStart']);
    const origDur = Number(block.dataset['tlDur']);
    drag = {
      id: block.dataset['tlId'] ?? '',
      kind: target?.closest('[data-tl-resize]') ? 'resize' : 'move',
      startY: event.clientY,
      origTop: Number.parseFloat(block.style.top) || 0,
      origStart,
      origDur,
      el: block,
    };
    dragStart = origStart;
    dragDur = origDur;
    block.setPointerCapture(event.pointerId);
    block.classList.add('tl-block--dragging');
    event.preventDefault();
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!drag) return;
    const deltaMin = (event.clientY - drag.startY) / PX_PER_MIN;
    if (drag.kind === 'move') {
      dragStart = Math.max(0, snapMinutes(drag.origStart + deltaMin));
      drag.el.style.top = `${drag.origTop + (dragStart - drag.origStart) * PX_PER_MIN}px`;
    } else {
      dragDur = Math.max(15, snapMinutes(drag.origDur + deltaMin));
      drag.el.style.height = `${Math.max(20, dragDur * PX_PER_MIN)}px`;
    }
    setLabel(drag.el, dragStart, dragDur);
  };

  const onPointerUp = (): void => {
    if (!drag) return;
    const finished = drag;
    drag = undefined;
    finished.el.classList.remove('tl-block--dragging');
    commit(finished.id, finished.kind, dragStart, dragDur);
  };

  return { onPointerDown, onPointerMove, onPointerUp };
};
