/** Tally how often each key occurs, in first-seen order. The branch-free stand-in
 *  for the `for` loop that increments a Map counter. */
export const countBy = <K>(keys: readonly K[]): ReadonlyMap<K, number> =>
  keys.reduce((tally, key) => tally.set(key, (tally.get(key) ?? 0) + 1), new Map<K, number>());
