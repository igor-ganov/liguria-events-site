/** One WFS grid cell as [cacheKey, bbox] — what tilesInBbox() hands back. */
export type CivicTile = readonly [string, readonly [number, number, number, number]];

/** How many cells one viewport move may fetch; the rest arrive on the next one,
 *  so a fast pan never queues hundreds of requests. */
const TILE_BUDGET = 12;

/**
 * The cells of a viewport still worth fetching: those whose key has not been
 * seen this session (revisited ground costs nothing), capped at the per-move
 * budget. Deduplication is by KEY, so the same cell reached from two viewports
 * is fetched exactly once.
 */
export const freshTiles =
  (seen: ReadonlySet<string>) =>
  (tiles: readonly CivicTile[]): readonly CivicTile[] =>
    tiles.filter(([key]) => !seen.has(key)).slice(0, TILE_BUDGET);
