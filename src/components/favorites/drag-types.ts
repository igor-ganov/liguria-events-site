// The shapes the timeline drag is written against. Types only — the geometry is
// pure functions, the DOM writes a thin shell, each in its own module.

/** Which interaction a pointer gesture turned out to be. `pending` is the
 *  undecided state before the axis is known. */
export type Gesture = 'pending' | 'move' | 'resize-top' | 'resize-bottom' | 'swipe';

/** The block being dragged, frozen at pointer-down. */
export type Drag = Readonly<{
  id: string;
  day: string;
  startX: number;
  startY: number;
  origStart: number;
  origDur: number;
  origTop: number;
  el: HTMLElement;
  axis: HTMLElement;
  mouse: boolean;
}>;

/** What a finished gesture asks the page to persist. */
export type DragCommit =
  | Readonly<{ kind: 'move'; id: string; day: string; index: number; startMin: number }>
  | Readonly<{ kind: 'resize'; id: string; day: string; durMin: number }>
  | Readonly<{ kind: 'resize-top'; id: string; day: string; startMin: number; durMin: number }>;

export type TimelineCommit = (commit: DragCommit) => void;

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

/** The live gesture: the block, the axis it settled on, and the values the
 *  release will commit. */
export type DragState = {
  drag?: Drag | undefined;
  gesture: Gesture;
  dragStart: number;
  dragDur: number;
  moveDy: number;
  swipeDx: number;
};
