import { editorState } from './editor-state.ts';
import { renderEditor } from './render-editor.ts';

/** Shell: drop this route's own base, falling back to the global one. */
export const clearRouteBase = (): void => {
  editorState.payload = { ...editorState.payload, base: undefined };
  renderEditor();
};
