// Favourites live in localStorage so they work with no account; on sign-in they
// are merged into D1 (one-time handoff) and D1 becomes the source of truth,
// mirrored back to localStorage so the two never diverge. Toggling is delegated
// (one document listener) so it covers cards rendered now and after any SPA nav.
import { favoritesState } from './favorites-state.ts';
import { onFavoriteClick } from './on-favorite-click.ts';
import { paintFavorites } from './paint-favorites.ts';
import { readFavorites } from './read-favorites.ts';
import { syncFavoritesOnLogin } from './sync-favorites-on-login.ts';

export { readFavorites } from './read-favorites.ts';

/** Shell: adopt the stored ids, wire the delegated toggle once, and paint. */
export const initFavorites = (): void => {
  favoritesState.ids = new Set(readFavorites());
  [favoritesState]
    .filter((state) => !state.wired)
    .forEach((state) => {
      state.wired = true;
      document.addEventListener('click', onFavoriteClick, true);
      void syncFavoritesOnLogin();
    });
  paintFavorites();
};
