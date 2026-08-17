import { editorState } from './editor-state.ts';
import { renderEditor } from './render-editor.ts';
import type { DayGroup } from '../../lib/favorites/build-route.ts';

/** Shell: adopt a new arrangement (the pure edit ops produce it) and re-render. */
export const withGroups = (groups: readonly DayGroup[]): void => {
  editorState.payload = { ...editorState.payload, groups };
  renderEditor();
};
