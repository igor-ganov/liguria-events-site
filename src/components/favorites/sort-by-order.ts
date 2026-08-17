const LAST = 1e9; // rank for an id the saved order never mentioned

/** Reorder ids to a saved order. Unknown ids all share the last rank, so a
 *  stable sort leaves them in their existing places at the end; without an
 *  order at all the list is returned untouched. */
export const sortByOrder = (
  ids: readonly string[],
  order: readonly string[] | undefined,
): readonly string[] => {
  const rank = new Map<string, number>((order ?? []).map((id, index) => [id, index]));
  return [...ids].sort((a, b) => (rank.get(a) ?? LAST) - (rank.get(b) ?? LAST));
};
