import { isDefined } from '../is-defined.ts';

/** Attach a listener exactly once per element. The element carries the flag as
 *  a data attribute, so re-running after an SPA swap (or on a persisted node)
 *  never stacks handlers — the branch-free stand-in for `if (el.dataset.x)`. */
export const bindOnce = <T extends HTMLElement>(
  element: T | undefined,
  flag: string,
  bind: (el: T) => void,
): void => {
  [element]
    .filter(isDefined)
    .filter((el) => el.dataset[flag] !== 'true')
    .forEach((el) => {
      el.dataset[flag] = 'true';
      bind(el);
    });
};
