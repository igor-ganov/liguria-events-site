import { branch } from '../../lib/branch.ts';
import { fabMove } from './fab-move.ts';
import type { FabMove } from './fab-move.ts';

/**
 * Brings the floating menu button back, and sends it away again, on pages that
 * keep it out of the words (any page carrying `[data-shy-fab]`, whose
 * stylesheet hides the button until `data-fab-back` is set — so it is never
 * drawn over the first screen, not even for a frame). It comes back when the
 * reader scrolls up or reaches the end. Bound once per document.
 */
export const shyFab = (): void => {
  const root = document.documentElement;
  const moves: Readonly<Record<FabMove, () => void>> = {
    away: () => root.removeAttribute('data-fab-back'),
    back: () => root.setAttribute('data-fab-back', ''),
    stay: () => undefined,
  };
  const shy = (): boolean => document.querySelector('[data-shy-fab]') !== null;
  let previous = globalThis.scrollY;
  const settle = (): void => {
    previous = globalThis.scrollY;
    moves.away();
  };
  const onScroll = (): void => {
    const current = globalThis.scrollY;
    const room = root.scrollHeight - current - globalThis.innerHeight;
    const move = branch(shy())<FabMove>(() => fabMove({ previous, current, room }), () => 'stay');
    previous = current;
    moves[move]();
  };
  settle();
  globalThis.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('astro:page-load', settle);
};
