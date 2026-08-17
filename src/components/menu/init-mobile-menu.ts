import { fabParts } from './fab-parts.ts';
import { wireFab } from './wire-fab.ts';

/** Wire every flying menu on the page, once. Re-run after a ClientRouter swap,
 *  where the wired wrapper has been replaced by a fresh, unwired one. */
export const initMobileMenu = (): void => {
  [...document.querySelectorAll<HTMLElement>('[data-fab-wrapper]')]
    .filter((wrap) => wrap.dataset['fabInit'] !== 'true')
    .forEach((wrap) => {
      wrap.dataset['fabInit'] = 'true';
      fabParts(wrap).forEach((parts) => wireFab(wrap, parts));
    });
};
