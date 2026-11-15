// The usual reciprocal-rank-fusion constant is 60, tuned for long result
// lists; a handful of suggestions wants the top of each list to count more.
const K = 10;

const add = (scores: Map<string, number>) => (list: readonly string[]): void =>
  list.forEach((id, rank) => scores.set(id, (scores.get(id) ?? 0) + 1 / (K + rank + 1)));

/**
 * Reciprocal-rank fusion: one ranking out of several, without comparing their
 * scores — a fuzzy-letter score and a cosine are not on one scale. An id both
 * agree on rises; a tie keeps the order of the list given first, because a Map
 * remembers insertion order and the sort is stable.
 */
export const fuseRanks = (lists: readonly (readonly string[])[]): readonly string[] => {
  const scores = new Map<string, number>();
  lists.forEach(add(scores));
  return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
};
