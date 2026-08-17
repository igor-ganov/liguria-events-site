import { branch } from '../../lib/branch.ts';

/** The ` disabled` attribute, or nothing — for a button at the end of its run. */
export const disabledAttr = (disabled: boolean): string =>
  branch(disabled)(() => ' disabled', () => '');
