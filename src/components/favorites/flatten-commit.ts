import type { TimelineCommit } from './timeline-drag.ts';

export type DragCommit = Parameters<TimelineCommit>[0];

/** A drag commit with every field present, so one strategy table can dispatch
 *  all three kinds without re-narrowing the union at each call site. */
export type FlatCommit = Readonly<{
  kind: DragCommit['kind'];
  id: string;
  day: string;
  index: number;
  startMin: number;
  durMin: number;
}>;

export const flattenCommit = (commit: DragCommit): FlatCommit => {
  switch (commit.kind) {
    case 'move':
      return { ...commit, durMin: 0 };
    case 'resize':
      return { ...commit, index: 0, startMin: 0 };
    case 'resize-top':
      return { ...commit, index: 0 };
  }
};
