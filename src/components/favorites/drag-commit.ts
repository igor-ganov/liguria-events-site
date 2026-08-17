import type { DragCommit, Gesture } from './drag-types.ts';

/** Everything a finished gesture could carry; each kind takes what it needs. */
export type CommitValues = Readonly<{
  id: string;
  day: string;
  index: number;
  startMin: number;
  durMin: number;
}>;

const BY_GESTURE: Readonly<Record<Gesture, (v: CommitValues) => readonly DragCommit[]>> = {
  pending: () => [],
  swipe: () => [], // a swipe deletes, it does not commit a time
  move: (v) => [{ kind: 'move', id: v.id, day: v.day, index: v.index, startMin: v.startMin }],
  'resize-bottom': (v) => [{ kind: 'resize', id: v.id, day: v.day, durMin: v.durMin }],
  'resize-top': (v) => [
    { kind: 'resize-top', id: v.id, day: v.day, startMin: v.startMin, durMin: v.durMin },
  ],
};

/** What a released gesture commits, as a 0-or-1 list. */
export const dragCommit = (gesture: Gesture, values: CommitValues): readonly DragCommit[] =>
  BY_GESTURE[gesture](values);
