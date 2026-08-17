import { editorState } from './editor-state.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { removeStop, reorderStop } from './route-edit-ops.ts';
import { withGroups } from './with-groups.ts';

const OPS: Readonly<Record<string, (id: string, day: string) => void>> = {
  remove: (id, day) => withGroups(removeStop(editorState.payload.groups, id, day)),
  up: (id, day) => withGroups(reorderStop(editorState.payload.groups, id, day, -1)),
  down: (id, day) => withGroups(reorderStop(editorState.payload.groups, id, day, 1)),
};

/** Shell: the ↑ / ↓ / ✕ buttons on a list-view stop. The move and add SELECTs
 *  carry data-op too but commit on change, so a click on one does nothing. */
export const runEditorOp = (element: HTMLElement): void => {
  [element]
    .filter((el) => el.tagName !== 'SELECT')
    .flatMap((el) => [OPS[el.dataset['op'] ?? '']].filter(isDefined))
    .forEach((op) => op(element.dataset['id'] ?? '', element.dataset['day'] ?? ''));
};
