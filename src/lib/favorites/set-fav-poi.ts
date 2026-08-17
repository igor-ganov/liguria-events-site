import { readFavPois } from './read-fav-pois.ts';
import { writeFavPois } from './write-fav-pois.ts';
import type { FavPoi } from './fav-poi.ts';

/** Remember a favourited POI, replacing any earlier capture of it. */
export const setFavPoi = (poi: FavPoi): void => writeFavPois({ ...readFavPois(), [poi.id]: poi });
