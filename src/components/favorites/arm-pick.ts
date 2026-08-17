import { editorState } from './editor-state.ts';
import { renderEditor } from './render-editor.ts';
import { togglePick } from './toggle-pick.ts';
import type { PickMode } from './pick-mode.ts';

/** Shell: arm (or cancel) a base picker — the next map click sets that point. */
export const armPick = (next: PickMode): void => {
  editorState.pick = togglePick(editorState.pick, next);
  renderEditor();
};
