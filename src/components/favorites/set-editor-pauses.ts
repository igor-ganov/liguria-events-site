import { editorState } from './editor-state.ts';
import { renderEditor } from './render-editor.ts';
import type { Durations } from '../../lib/favorites/day-schedule.ts';

/** Shell: adopt a new set of manual breaks on the route being edited. */
export const setEditorPauses = (pauses: Durations): void => {
  editorState.payload = { ...editorState.payload, pauses };
  renderEditor();
};
