import { branch } from '../../lib/branch.ts';

/** The ` aria-pressed="true"` attribute, or nothing — for an armed toggle chip.
 *  An unarmed chip carries no attribute at all, as it always has. */
export const pressedAttr = (pressed: boolean): string =>
  branch(pressed)(() => ' aria-pressed="true"', () => '');
