import { branch } from '../../lib/branch.ts';
import { fabMove } from './fab-move.ts';
import type { FabMove } from './fab-move.ts';

/**
 * Lets the floating menu button step aside on pages that ask for it (any page
 * carrying `[data-shy-fab]`) so it never sits over the words being read. Bound
 * once per document: a later page without the marker brings the button back.
 */
export const shyFab = (): void => {
  const root = document.documentElement;
  const moves: Readonly<Record<FabMove, () => void>> = {
    away: () => root.setAttribute('data-fab-away', ''),
    back: () => root.removeAttribute('data-fab-away'),
    stay: () => undefined,
  };
  let previous = globalThis.scrollY;
  const onScroll = (): void => {
    const current = globalThis.scrollY;
    const room = root.scrollHeight - current - globalThis.innerHeight;
    const move = branch(document.querySelector('[data-shy-fab]') !== null)<FabMove>(
      () => fabMove({ previous, current, room }),
      () => 'back',
    );
    previous = current;
    moves[move]();
  };
  globalThis.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('astro:page-load', onScroll);
};
