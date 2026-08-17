import { REGION_GEO } from './region-geo.ts';

/** Region slugs whose bbox intersects the given map bounds — the shards a
 *  viewport needs. West/east/south/north are the map's current edges. */
export const regionsInView = (
  west: number,
  south: number,
  east: number,
  north: number,
): readonly string[] =>
  Object.entries(REGION_GEO)
    .filter(([, g]) => g.bbox[0] <= east && g.bbox[2] >= west && g.bbox[1] <= north && g.bbox[3] >= south)
    .map(([slug]) => slug);
