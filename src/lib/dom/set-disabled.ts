import { isDefined } from '../is-defined.ts';

/** Enable or disable a control, doing nothing when it is absent — the
 *  branch-free stand-in for `if (el) el.disabled = …`. */
export const setDisabled = (element: HTMLButtonElement | undefined, disabled: boolean): void => {
  [element].filter(isDefined).forEach((node) => {
    node.disabled = disabled;
  });
};
