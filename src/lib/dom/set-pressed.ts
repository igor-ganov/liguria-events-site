import { isDefined } from '../is-defined.ts';

/** Write aria-pressed on a toggle button, doing nothing when it is absent —
 *  the branch-free stand-in for `if (el) el.setAttribute('aria-pressed', …)`. */
export const setPressed = (element: Element | undefined, pressed: boolean): void => {
  [element].filter(isDefined).forEach((node) => {
    node.setAttribute('aria-pressed', String(pressed));
  });
};
