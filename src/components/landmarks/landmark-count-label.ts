import { branch } from '../../lib/branch.ts';

/** The counter above the grid. Past the render cap it says how much of the
 *  match is actually on screen. */
export const landmarkCountLabel = (matched: number, cap: number): string =>
  branch(matched > cap)(
    () => `${cap} / ${matched}`,
    () => `${matched}`,
  );
