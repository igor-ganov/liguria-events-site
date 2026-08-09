import { html, render } from 'lit';
import { renderMiniCard } from '../shared/render-mini-card.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { decodeEventList } from '../../lib/events/decode-event-list.ts';
import { readFavorites } from './init-favorites.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

// The favourites page renders the user's favourited events client-side from the
// full corpus (favourites are a client concern). Re-renders on `favchange`, so
// un-hearting a card here removes it and the sign-in D1 sync fills it in.

let corpus: readonly CompactEvent[] | undefined;

const fetchCorpus = async (): Promise<readonly CompactEvent[]> => {
  if (corpus) return corpus;
  try {
    const json: unknown = await (await fetch(EVENTS_URL)).json();
    const list = json && typeof json === 'object' && 'events' in json ? json.events : json;
    corpus = decodeEventList(list);
  } catch {
    corpus = [];
  }
  return corpus;
};

const paint = async (): Promise<void> => {
  const island = readUiIsland();
  const listEl = document.querySelector<HTMLElement>('[data-fav-list]');
  const emptyEl = document.querySelector<HTMLElement>('[data-fav-empty]');
  const toolsEl = document.querySelector<HTMLElement>('[data-fav-tools]');
  const ids = readFavorites();
  // Gate the route tools on whether the user HAS favourites, not on whether the
  // corpus currently resolves them. Otherwise a slow/failed corpus fetch, or
  // favourites whose events have rolled off it, hides the whole toolbar — the
  // "Generate route button disappeared" bug. The list below still shows only
  // the events that resolve.
  if (emptyEl) emptyEl.hidden = ids.size > 0;
  if (toolsEl) toolsEl.hidden = ids.size === 0;
  const events = await fetchCorpus();
  const favs = events
    .filter((event) => ids.has(event.id))
    .toSorted((a, b) => (a.s < b.s ? -1 : a.s > b.s ? 1 : 0));
  if (listEl) render(html`${favs.map((event) => renderMiniCard(event, island.ui, island.lang))}`, listEl);
};

let listening = false;

export const initFavoritesPage = (): void => {
  void paint();
  if (!listening) {
    listening = true;
    document.addEventListener('favchange', () => void paint());
  }
};
