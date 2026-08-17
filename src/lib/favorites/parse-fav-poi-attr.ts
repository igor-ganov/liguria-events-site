import { parseFavPoi } from './parse-fav-poi.ts';
import type { FavPoi } from './fav-poi.ts';

/** Parse the JSON a POI favourite button carries in data-fav-poi. Missing or
 *  malformed JSON reads as "no POI". */
export const parseFavPoiAttr = (json: string | undefined): FavPoi | undefined => {
  try {
    return parseFavPoi(JSON.parse(json ?? ''));
  } catch {
    return undefined;
  }
};
