import { branch } from '../branch.ts';

/** `aria-current="true"` on the active row and the attribute omitted elsewhere.
 *  Styling keys off the attribute's presence, so an explicit "false" would
 *  light up every row. */
export const ariaCurrent = (active: boolean): 'true' | undefined =>
  branch(active)<'true' | undefined>(
    () => 'true',
    () => undefined,
  );
