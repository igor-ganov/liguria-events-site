import type { Tip } from './tip.ts';

/** The tip under the cursor, and the cursor for the one after it. The list
 *  wraps round, so a long session cycles through every tip before repeating. */
export const nextTip = (
  tips: readonly Tip[],
  cursor: number,
): Readonly<{ tip: Tip | undefined; cursor: number }> =>
  [tips.length]
    .filter((count) => count > 0)
    .map((count) => ({ tip: tips[cursor % count], cursor: cursor + 1 }))
    .at(0) ?? { tip: undefined, cursor };
