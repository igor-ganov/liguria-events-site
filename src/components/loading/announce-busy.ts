import { isDefined } from '../../lib/is-defined.ts';

/** Say, through the page's polite live region, that something is loading — or
 *  clear it with `false`. The words are the page's own, in its language. */
export const announceBusy = (busy: boolean): void => {
  [document.getElementById('loading-status') ?? undefined].filter(isDefined).forEach((region) => {
    region.textContent = [region.dataset['busyText'] ?? ''].filter(() => busy).at(0) ?? '';
  });
};
