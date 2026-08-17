/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */
import { branch } from '../branch.ts';

/**
 * The word boundary a quote may be cut at, so a snippet never starts or ends
 * mid-word.
 * @param text - The source text.
 * @param at - Where the cut would like to fall.
 * @param forward - Search towards the end (true) or the start (false).
 * @returns The offset of the nearest space, or the end of the text that way.
 */
export const wordEdge = (text: string, at: number, forward: boolean): number => {
  const space = branch(forward)(
    () => text.indexOf(' ', at),
    () => text.lastIndexOf(' ', at),
  );
  return branch(space < 0)(
    () => branch(forward)(() => text.length, () => 0),
    () => space,
  );
};
