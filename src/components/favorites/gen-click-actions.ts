import { addPause } from './add-pause.ts';
import { generate } from './generate.ts';
import { genState } from './gen-state.ts';
import { omitKey } from './omit-key.ts';
import { saveAndLabel } from './save-and-label.ts';
import { setGenMode } from './set-gen-mode.ts';
import { setGenPauses } from './set-gen-pauses.ts';
import { setGenView } from './set-gen-view.ts';
import type { ClickAction } from './run-click-action.ts';

/** Every control on the generated route, in the order a click is offered to
 *  them — the first match wins, exactly as the guard chain it replaces did. */
export const GEN_CLICK_ACTIONS: readonly ClickAction[] = [
  { selector: '[data-route-mode]', run: setGenMode },
  { selector: '[data-route-view]', run: (el) => setGenView(el.dataset['routeView']) },
  {
    selector: '[data-add-pause]',
    run: (el) => setGenPauses(addPause(genState.pauses, el.dataset['after'] ?? '')),
  },
  {
    selector: '[data-clear-pause]',
    run: (el) => setGenPauses(omitKey(genState.pauses, el.dataset['after'] ?? '')),
  },
  { selector: '[data-route-generate]', run: () => void generate() },
  { selector: '[data-route-save]', run: saveAndLabel },
];
