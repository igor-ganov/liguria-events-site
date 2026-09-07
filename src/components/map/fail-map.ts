import { setHidden } from '../../lib/dom/set-hidden.ts';

/**
 * The map engine itself never arrived.
 *
 * It is a megabyte behind a dynamic import, and with no signal it is not on
 * the device unless this reader has opened the map before. Nothing then
 * rejects loudly: the import fails, no map is ever built, and the skeleton
 * spins for half a minute over a page that was never going to draw.
 */
export const failMap = (canvas: HTMLElement): void => {
  canvas.dataset['loading'] = 'false';
  setHidden(document.querySelector<HTMLElement>('[data-map-retry]') ?? undefined, false);
};
