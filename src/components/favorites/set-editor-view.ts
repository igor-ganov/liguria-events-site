import { editorState } from './editor-state.ts';
import { renderEditor } from './render-editor.ts';
import { toView } from './to-view.ts';

/** Shell: switch the editor between the day timeline and the editable list. */
export const setEditorView = (value: unknown): void => {
  editorState.view = toView(value);
  renderEditor();
};
