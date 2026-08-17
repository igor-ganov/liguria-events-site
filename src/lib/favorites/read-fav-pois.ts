import { FAV_POI_KEY } from './fav-poi-key.ts';
import { parseFavPoiMap } from './parse-fav-poi-map.ts';
import type { FavPoi } from './fav-poi.ts';

/** The favourited POIs, by id. Empty when storage is blocked or corrupt. */
export const readFavPois = (): Readonly<Record<string, FavPoi>> => {
  try {
    return parseFavPoiMap(JSON.parse(localStorage.getItem(FAV_POI_KEY) ?? '{}'));
  } catch {
    return {};
  }
};
