import { editorState } from './editor-state.ts';
import { renderEditor } from './render-editor.ts';

/** Shell: a typed per-stop duration on the route being edited. */
export const setEditorDuration = (id: string, minutes: number): void => {
  const { payload } = editorState;
  editorState.payload = { ...payload, durations: { ...payload.durations, [id]: minutes } };
  renderEditor();
};
