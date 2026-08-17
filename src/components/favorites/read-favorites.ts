import { asIdList } from './as-id-list.ts';
import { FAVORITES_KEY } from './favorites-key.ts';
import { readJsonStore } from './read-json-store.ts';

/** Shell: the favourite ids this device holds. Favourites live in localStorage
 *  so they work with no account; a blocked or corrupted store reads as none. */
export const readFavorites = (): ReadonlySet<string> => new Set(asIdList(readJsonStore(FAVORITES_KEY)));
