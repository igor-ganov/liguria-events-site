import { branch } from '../branch.ts';
import { readFavPois } from './read-fav-pois.ts';
import { writeFavPois } from './write-fav-pois.ts';

/** Forget a favourited POI. Storage is left untouched when it wasn't there. */
export const deleteFavPoi = (id: string): void => {
  const { [id]: removed, ...rest } = readFavPois();
  branch(removed !== undefined)(
    () => writeFavPois(rest),
    () => undefined,
  );
};
