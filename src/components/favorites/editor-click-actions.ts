import { addPause } from './add-pause.ts';
import { armPick } from './arm-pick.ts';
import { clearRouteBase } from './clear-route-base.ts';
import { editorState } from './editor-state.ts';
import { omitKey } from './omit-key.ts';
import { requestRemove } from './request-remove.ts';
import { runEditorOp } from './run-editor-op.ts';
import { saveEdits } from './save-edits.ts';
import { setEditorPauses } from './set-editor-pauses.ts';
import { setEditorView } from './set-editor-view.ts';
import type { ClickAction } from './run-click-action.ts';

const pauses = () => editorState.payload.pauses;
const after = (el: HTMLElement): string => el.dataset['after'] ?? '';
const day = (el: HTMLElement): string => el.dataset['day'] ?? '';

/** Every control in the owner editor, in the order a click is offered to them.
 *  The "+" droplet drops a standard 1-hour break after a stop; a click on the
 *  break chip clears it. */
export const EDITOR_CLICK_ACTIONS: readonly ClickAction[] = [
  { selector: '[data-route-save-edits]', run: () => void saveEdits() },
  { selector: '[data-route-view]', run: (el) => setEditorView(el.dataset['routeView']) },
  { selector: '[data-tl-del]', run: (el) => void requestRemove(el.dataset['tlId'] ?? '') },
  { selector: '[data-add-pause]', run: (el) => setEditorPauses(addPause(pauses(), after(el))) },
  { selector: '[data-clear-pause]', run: (el) => setEditorPauses(omitKey(pauses(), after(el))) },
  { selector: '[data-pick-base-route]', run: () => armPick({ scope: 'route', kind: 'base' }) },
  { selector: '[data-pick-base-global]', run: () => armPick({ scope: 'global', kind: 'base' }) },
  { selector: '[data-clear-base]', run: clearRouteBase },
  { selector: '[data-pick-base]', run: (el) => armPick({ scope: 'day', day: day(el), kind: 'base' }) },
  { selector: '[data-pick-final]', run: (el) => armPick({ scope: 'day', day: day(el), kind: 'final' }) },
  { selector: '[data-op]', run: runEditorOp },
];
