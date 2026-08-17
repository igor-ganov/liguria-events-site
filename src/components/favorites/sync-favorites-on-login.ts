import { favoritesState } from './favorites-state.ts';
import { fetchLoggedIn } from './fetch-logged-in.ts';
import { mergedFavoriteIds } from './merged-favorite-ids.ts';
import { paintFavorites } from './paint-favorites.ts';
import { persistFavorites } from './persist-favorites.ts';

const adopt = (ids: readonly string[]): void => {
  favoritesState.ids = new Set(ids);
  persistFavorites();
  paintFavorites();
};

/** Shell: on sign-in, merge the anonymous localStorage set into the account and
 *  adopt the merged result as the truth. */
export const syncFavoritesOnLogin = async (): Promise<void> => {
  favoritesState.loggedIn = await fetchLoggedIn();
  const merged = await Promise.all(
    [favoritesState.loggedIn].filter(Boolean).map(() => mergedFavoriteIds()),
  );
  merged.flat().forEach(adopt);
};
