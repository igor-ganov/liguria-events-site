/**
 * The items of a freshly loaded batch that are genuinely new: neither already
 * known nor repeated within the batch itself. A landmark near a region boundary
 * ships in several region shards, so once a zoomed-out viewport spans both, the
 * same id arrives twice and would otherwise mount two markers on one spot.
 *
 * One pass over a Set, NOT a nested scan. The obvious `findIndex` form is
 * quadratic, which is invisible for a few thousand landmarks and catastrophic
 * for places: two region shards are ~68k venues, and 68k² comparisons blocked
 * the main thread for minutes.
 *
 * The type parameter sits on the INNER call so it infers from the items, not
 * from `seen` (which carries no element type) — otherwise every caller gets the
 * bare `{ id: string }` constraint back and loses the landmark/place fields.
 */
export const newById =
  (seen: ReadonlySet<string>) =>
  <T extends Readonly<{ id: string }>>(items: readonly T[]): readonly T[] => {
    const taken = new Set(seen);
    return items.filter((item) => {
      const fresh = !taken.has(item.id);
      taken.add(item.id);
      return fresh;
    });
  };
