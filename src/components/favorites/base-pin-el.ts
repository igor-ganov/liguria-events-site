import { branch } from '../../lib/branch.ts';

/** The pin for a day's base (🏠) or its distinct final point (🏁). */
export const basePinEl = (final: boolean): HTMLElement => {
  const el = document.createElement('div');
  el.className = 'route-pin route-pin--base';
  el.textContent = branch(final)(() => '🏁', () => '🏠');
  return el;
};
