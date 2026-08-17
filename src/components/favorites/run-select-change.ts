import { addStopToDay, moveStopToDay } from './route-edit-ops.ts';
import { editorState } from './editor-state.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { withGroups } from './with-groups.ts';

const OPS: Readonly<Record<string, (select: HTMLSelectElement) => void>> = {
  move: (select) =>
    withGroups(
      moveStopToDay(
        editorState.payload.groups,
        select.dataset['id'] ?? '',
        select.dataset['from'] ?? '',
        select.value,
      ),
    ),
  add: (select) =>
    withGroups(addStopToDay(editorState.payload.groups, select.value, select.dataset['day'] ?? '')),
};

/** Shell: the move-to-day and add-a-favourite dropdowns. The empty placeholder
 *  option commits nothing. */
export const runSelectChange = (select: HTMLSelectElement): void => {
  [select]
    .filter((el) => el.value !== '')
    .flatMap((el) => [OPS[el.dataset['op'] ?? '']].filter(isDefined))
    .forEach((op) => op(select));
};
