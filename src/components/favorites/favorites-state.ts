/** The page's live favourites: the ids held now, whether they are backed by an
 *  account, and whether the delegated listener is already attached. */
export type FavoritesState = {
  ids: ReadonlySet<string>;
  loggedIn: boolean;
  wired: boolean;
};

export const favoritesState: FavoritesState = { ids: new Set(), loggedIn: false, wired: false };
