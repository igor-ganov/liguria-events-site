import { commitTarget } from './commit-target.ts';
import { flattenCommit } from './flatten-commit.ts';
import type { FlatCommit } from './flatten-commit.ts';
import type { CommitTarget } from './commit-target.ts';
import type { TimelineCommit } from './timeline-drag.ts';

/** What a page does with each kind of timeline drag. The generator and the
 *  owner editor differ only in these five, so the dispatch itself is shared. */
export type CommitHandlers = Readonly<{
  breakMove: (anchor: string, day: string, startMin: number) => void;
  breakResize: (anchor: string, durMin: number) => void;
  move: (id: string, day: string, index: number, startMin: number) => void;
  resizeTop: (id: string, day: string, startMin: number, durMin: number) => void;
  resize: (id: string, day: string, durMin: number) => void;
}>;

type Route = (commit: FlatCommit, handlers: CommitHandlers) => void;

// A break carries no top-resize handle, so that cell is unreachable.
const ROUTES: Readonly<Record<CommitTarget['kind'], Readonly<Record<FlatCommit['kind'], Route>>>> = {
  break: {
    move: (c, h) => h.breakMove(c.id, c.day, c.startMin),
    resize: (c, h) => h.breakResize(c.id, c.durMin),
    'resize-top': () => undefined,
  },
  stop: {
    move: (c, h) => h.move(c.id, c.day, c.index, c.startMin),
    resize: (c, h) => h.resize(c.id, c.day, c.durMin),
    'resize-top': (c, h) => h.resizeTop(c.id, c.day, c.startMin, c.durMin),
  },
};

export const makeCommitRouter =
  (handlers: CommitHandlers): TimelineCommit =>
  (raw) => {
    const commit = flattenCommit(raw);
    const target = commitTarget(commit.id);
    ROUTES[target.kind][commit.kind]({ ...commit, id: target.ref }, handlers);
  };
