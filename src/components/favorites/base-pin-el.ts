import { branch } from '../../lib/branch.ts';
import { uiIcon } from '../../lib/icons/ui-icon.ts';
import type { UiIconName } from '../../lib/icons/ui-icon-paths.ts';

/** The pin for a day's base (a house) or its distinct final point (a flag). */
export const basePinEl = (final: boolean): HTMLElement => {
  const el = document.createElement('div');
  el.className = 'route-pin route-pin--base';
  el.innerHTML = uiIcon(branch(final)<UiIconName>(() => 'flag', () => 'home'), '1em');
  return el;
};
