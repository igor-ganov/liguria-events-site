import { isDefined } from '../is-defined.ts';

/** Show or hide an element, doing nothing when it is absent — the branch-free
 *  stand-in for `if (el) el.hidden = …`. */
export const setHidden = (element: HTMLElement | undefined, hidden: boolean): void => {
  [element].filter(isDefined).forEach((node) => {
    node.hidden = hidden;
  });
};
