import { isDefined } from '../is-defined.ts';

/** Write an element's text, doing nothing when the element is absent — the
 *  branch-free stand-in for `if (el) el.textContent = …`. */
export const setText = (element: HTMLElement | undefined, text: string): void => {
  [element].filter(isDefined).forEach((node) => {
    node.textContent = text;
  });
};
