import { genState } from './gen-state.ts';
import { toMode } from './to-mode.ts';

/** Shell: choose the travel mode and mark the chosen chip pressed. The route is
 *  not rebuilt until Generate — the chips only set the intent. */
export const setGenMode = (button: HTMLElement): void => {
  genState.mode = toMode(button.dataset['routeMode']);
  document
    .querySelectorAll<HTMLElement>('[data-route-mode]')
    .forEach((chip) => chip.setAttribute('aria-pressed', String(chip === button)));
};
