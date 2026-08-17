import { confirmDialog } from './confirm-dialog.ts';
import { editorState } from './editor-state.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { removeStop } from './route-edit-ops.ts';
import { titleOf } from '../../lib/events/title-of.ts';
import { withGroups } from './with-groups.ts';

/** Shell: confirm, then take a stop out of the route (from the timeline's ✕ or
 *  a left swipe). The /route page is English-only. */
export const requestRemove = async (id: string): Promise<void> => {
  const { lang, ui } = readUiIsland();
  const title = [editorState.byId.get(id)].filter(isDefined).map(titleOf(lang)).at(0) ?? id;
  const ok = await confirmDialog({
    message: `Remove “${title}” from the route?`,
    cancel: 'Cancel',
    confirm: ui.route.remove,
  });
  [ok].filter((confirmed) => confirmed).forEach(() => {
    const block = document.querySelector<HTMLElement>(`.tl-block[data-tl-id="${CSS.escape(id)}"]`);
    withGroups(removeStop(editorState.payload.groups, id, block?.dataset['tlDay'] ?? ''));
  });
};
