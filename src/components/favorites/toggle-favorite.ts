import { branch } from '../../lib/branch.ts';
import { favMethod } from './fav-method.ts';
import { favoritesState } from './favorites-state.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { paintFavorites } from './paint-favorites.ts';
import { persistFavorites } from './persist-favorites.ts';
import { sendFavorites } from './send-favorites.ts';
import { deleteFavPoi, parseFavPoiAttr, setFavPoi } from '../../lib/favorites/fav-pois.ts';

// A landmark/place button carries its render data; stash it (events don't).
const add = (button: HTMLElement, id: string): void => {
  favoritesState.ids = new Set([...favoritesState.ids, id]);
  [parseFavPoiAttr(button.dataset['favPoi'])].filter(isDefined).forEach(setFavPoi);
};

const remove = (id: string): void => {
  favoritesState.ids = new Set([...favoritesState.ids].filter((held) => held !== id));
  deleteFavPoi(id);
};

const apply = (button: HTMLElement, id: string): void => {
  const turningOn = !favoritesState.ids.has(id);
  branch(turningOn)<void>(() => add(button, id), () => remove(id));
  persistFavorites();
  paintFavorites();
  [turningOn]
    .filter(() => favoritesState.loggedIn)
    .forEach((on) => {
      void sendFavorites(favMethod(on), { event: id });
    });
};

/** Shell: flip one favourite, then persist, repaint and mirror to the account. */
export const toggleFavorite = (button: HTMLElement): void => {
  [button.dataset['favId'] ?? ''].filter((id) => id !== '').forEach((id) => apply(button, id));
};
