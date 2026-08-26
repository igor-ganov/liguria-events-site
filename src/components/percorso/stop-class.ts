import { branch } from '../../lib/branch.ts';

/**
 * A filled stop means the event was made here; a hollow one means it was
 * found elsewhere. The difference is real, not a colour picked for variety.
 */
export const stopClass = (madeHere: boolean): string =>
  branch(madeHere)(
    () => 'fermata fermata--nostra',
    () => 'fermata',
  );
