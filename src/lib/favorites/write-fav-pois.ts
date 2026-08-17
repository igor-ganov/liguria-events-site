import { FAV_POI_KEY } from './fav-poi-key.ts';
import type { FavPoi } from './fav-poi.ts';

/** Persist the POI map — the one side effect of this store. */
export const writeFavPois = (map: Readonly<Record<string, FavPoi>>): void => {
  try {
    localStorage.setItem(FAV_POI_KEY, JSON.stringify(map));
  } catch {
    /* storage blocked — ignore */
  }
};
