import { applyEditorMove } from './apply-editor-move.ts';
import { editorBreakMove } from './editor-break-move.ts';
import { editorPinTop } from './editor-pin-top.ts';
import { editorResizeSteal } from './editor-resize-steal.ts';
import { editorState } from './editor-state.ts';
import { makeCommitRouter } from './make-commit-router.ts';
import { setEditorPauses } from './set-editor-pauses.ts';

const MIN_BREAK = 15;

/** What each timeline drag does to the route being edited. */
export const editorCommit = makeCommitRouter({
  breakMove: editorBreakMove,
  breakResize: (anchor, durMin) =>
    setEditorPauses({ ...editorState.payload.pauses, [anchor]: Math.max(MIN_BREAK, durMin) }),
  move: applyEditorMove,
  resizeTop: editorPinTop,
  resize: editorResizeSteal,
});
