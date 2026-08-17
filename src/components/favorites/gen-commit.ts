import { genApplyMove } from './gen-apply-move.ts';
import { genBreakMove } from './gen-break-move.ts';
import { genPinTop } from './gen-pin-top.ts';
import { genResizeSteal } from './gen-resize-steal.ts';
import { genState } from './gen-state.ts';
import { makeCommitRouter } from './make-commit-router.ts';
import { setGenPauses } from './set-gen-pauses.ts';

const MIN_BREAK = 15;

/** What each timeline drag does to the generated route. Every one of them
 *  persists, so a later Save embeds the arrangement. */
export const genCommit = makeCommitRouter({
  breakMove: genBreakMove,
  breakResize: (anchor, durMin) =>
    setGenPauses({ ...genState.pauses, [anchor]: Math.max(MIN_BREAK, durMin) }),
  move: genApplyMove,
  resizeTop: genPinTop,
  resize: genResizeSteal,
});
