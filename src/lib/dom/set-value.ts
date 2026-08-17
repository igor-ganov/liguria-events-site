import { isDefined } from '../is-defined.ts';

/** Write an input's value, doing nothing when the input is absent — the
 *  branch-free stand-in for `if (el) el.value = …`. */
export const setValue = (input: HTMLInputElement | undefined, value: string): void => {
  [input].filter(isDefined).forEach((node) => {
    node.value = value;
  });
};
