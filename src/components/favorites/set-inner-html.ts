import { isDefined } from '../../lib/is-defined.ts';

/** Write an element's markup, doing nothing when the element is absent — the
 *  branch-free stand-in for `if (el) el.innerHTML = …`. */
export const setInnerHtml = (element: HTMLElement | undefined, html: string): void => {
  [element].filter(isDefined).forEach((node) => {
    node.innerHTML = html;
  });
};
