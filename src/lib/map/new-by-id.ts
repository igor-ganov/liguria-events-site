/**
 * The items of a freshly loaded batch that are genuinely new: neither already
 * known nor repeated within the batch itself. A landmark near a region boundary
 * ships in several region shards, so once a zoomed-out viewport spans both, the
 * same id arrives twice and would otherwise mount two markers on one spot.
 */
// The type parameter sits on the INNER call so it infers from the items, not
// from `seen` (which carries no element type) — otherwise every caller gets the
// bare `{ id: string }` constraint back and loses the landmark/place fields.
export const newById =
  (seen: ReadonlySet<string>) =>
  <T extends Readonly<{ id: string }>>(items: readonly T[]): readonly T[] =>
    items.filter(
      (item, index) =>
        !seen.has(item.id) && items.findIndex((other) => other.id === item.id) === index,
    );
