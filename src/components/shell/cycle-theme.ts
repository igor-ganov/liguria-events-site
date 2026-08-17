import { applyThemePref } from './apply-theme-pref.ts';
import { branch } from '../../lib/branch.ts';
import { nextThemePref } from '../../lib/theme/next-theme-pref.ts';
import { revealRadius } from '../../lib/theme/reveal-radius.ts';

// The circular reveal is driven from CSS custom properties: the tap point and
// the radius that reaches the farthest corner.
const reveal = (event: MouseEvent, pref: string): void => {
  const html = document.documentElement;
  const { clientX: x, clientY: y } = event;
  html.style.setProperty('--x', `${x}px`);
  html.style.setProperty('--y', `${y}px`);
  html.style.setProperty('--r', `${revealRadius(x, y, innerWidth, innerHeight)}px`);
  document.startViewTransition?.({ update: () => applyThemePref(pref), types: ['theme'] });
};

/** One tap: light → dark → system, revealed as a circle from the tap wherever
 *  the browser supports view transitions. */
export const cycleTheme = (event: MouseEvent): void => {
  const pref = nextThemePref(document.documentElement.dataset['themePref'] ?? 'system');
  branch(typeof document.startViewTransition !== 'function')(
    () => applyThemePref(pref),
    () => reveal(event, pref),
  );
};
