import { favoritesState } from './favorites-state.ts';
import { FAVORITES_KEY } from './favorites-key.ts';
import { writeJsonStore } from './write-json-store.ts';

/** Shell: store the ids and tell the page they changed, so every island
 *  (counters, the favourites view, the map) repaints from one signal. */
export const persistFavorites = (): void => {
  const ids = [...favoritesState.ids];
  writeJsonStore(FAVORITES_KEY, ids);
  document.dispatchEvent(new CustomEvent('favchange', { detail: { ids } }));
};
