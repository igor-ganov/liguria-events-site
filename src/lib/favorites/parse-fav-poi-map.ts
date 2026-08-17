import { parseFavPoi } from './parse-fav-poi.ts';
import type { FavPoi } from './fav-poi.ts';

/** Parse a { id: FavPoi } map (from localStorage or an embedded route payload),
 *  dropping any malformed entry. */
export const parseFavPoiMap = (raw: unknown): Record<string, FavPoi> =>
  Object.fromEntries(
    Object.values(Object(raw ?? {}))
      .map(parseFavPoi)
      .filter((poi) => poi !== undefined)
      .map((poi) => [poi.id, poi]),
  );
