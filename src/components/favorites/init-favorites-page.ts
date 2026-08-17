// The favourites page renders the user's favourited events client-side from the
// full corpus (favourites are a client concern). Re-renders on `favchange`, so
// un-hearting a card here removes it and the sign-in D1 sync fills it in. The
// corpus cache, the list renderer and the comparator live one per file next to
// this shell and are unit-tested on their own.
import { byStart } from './by-start.ts';
import { cachedCorpus } from './cached-corpus.ts';
import { favPageState } from './fav-page-state.ts';
import { readFavPois } from '../../lib/favorites/fav-pois.ts';
import { readFavorites } from './read-favorites.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { renderFavList } from './render-fav-list.ts';
import { setHidden } from '../../lib/dom/set-hidden.ts';

const el = (selector: string): HTMLElement | undefined =>
  document.querySelector<HTMLElement>(selector) ?? undefined;

const paint = async (): Promise<void> => {
  const island = readUiIsland();
  const ids = readFavorites();
  // Gate the route tools on whether the user HAS favourites, not on whether the
  // corpus currently resolves them. Otherwise a slow/failed corpus fetch, or
  // favourites whose events have rolled off it, hides the whole toolbar — the
  // "Generate route button disappeared" bug. The list below still shows only
  // the events that resolve.
  setHidden(el('[data-fav-empty]'), ids.size > 0);
  setHidden(el('[data-fav-tools]'), ids.size === 0);
  // Favourited landmarks/places render from the local fav-pois store (their id
  // doesn't encode a region, so we can't look them up in the corpus).
  const pois = Object.values(readFavPois()).filter((poi) => ids.has(poi.id));
  const events = await cachedCorpus();
  const favs = events.filter((event) => ids.has(event.id)).toSorted(byStart);
  renderFavList(el('[data-fav-list]'), pois, favs, island);
};

export const initFavoritesPage = (): void => {
  void paint();
  [favPageState]
    .filter((state) => !state.listening)
    .forEach((state) => {
      state.listening = true;
      document.addEventListener('favchange', () => void paint());
    });
};
