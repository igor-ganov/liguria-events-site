const CELL = 0.004;

/** Grid cells covering a bbox as [cacheKey, cellBbox] — the unit of viewport
 *  WFS fetching + session caching, so revisited areas cost nothing. */
export const tilesInBbox = (
  west: number,
  south: number,
  east: number,
  north: number,
): readonly (readonly [string, readonly [number, number, number, number]])[] =>
  Array.from({ length: Math.floor(east / CELL) - Math.floor(west / CELL) + 1 }, (_, dx) =>
    Math.floor(west / CELL) + dx,
  ).flatMap((x) =>
    Array.from({ length: Math.floor(north / CELL) - Math.floor(south / CELL) + 1 }, (_, dy) =>
      Math.floor(south / CELL) + dy,
    ).map(
      (y) =>
        [`${x}:${y}`, [x * CELL, y * CELL, (x + 1) * CELL, (y + 1) * CELL]] as const,
    ),
  );
