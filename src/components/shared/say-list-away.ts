import type { Ui } from '../../lib/i18n/ui-schema.ts';

/**
 * Say why a list is empty when it is empty because the network is gone.
 *
 * These lists are downloaded when the page is opened — they are far too large
 * to keep on a device for a tunnel that may never happen — so with no signal
 * there is nothing to draw. An empty grid under a count of zero reads as a
 * region with nothing in it, which is a different and wrong thing to say.
 */
export const sayListAway = (grid: HTMLElement, ui: Ui): void => {
  const line = document.createElement('p');
  line.className = 'lm-loading';
  line.setAttribute('role', 'status');
  line.textContent = ui.offline.listAway;
  grid.replaceChildren(line);
};
