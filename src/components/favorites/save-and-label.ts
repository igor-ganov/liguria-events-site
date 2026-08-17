import { genState } from './gen-state.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { saveGeneratedRoute } from './save-generated-route.ts';
import { setText } from '../../lib/dom/set-text.ts';

/** Shell: the Save button — start the save and acknowledge the click at once,
 *  rather than leaving the button dead until the network answers. */
export const saveAndLabel = (): void => {
  void saveGeneratedRoute(genState.days);
  const button = document.querySelector<HTMLElement>('[data-route-save]') ?? undefined;
  setText(button, readUiIsland().ui.route.saved);
};
