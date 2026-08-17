import { branch } from '../../lib/branch.ts';

/** A numbered map pin for a stop; tight connections are marked. */
export const stopPinEl = (n: number, tight: boolean): HTMLElement => {
  const el = document.createElement('div');
  el.className = branch(tight)(() => 'route-pin route-pin--tight', () => 'route-pin');
  el.textContent = String(n);
  return el;
};
