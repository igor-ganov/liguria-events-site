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
  const events = await fetchCorpus();
  const ids = readFavorites();
  const favs = events
    .filter((event) => ids.has(event.id))
    .toSorted((a, b) => (a.s < b.s ? -1 : a.s > b.s ? 1 : 0));
  if (emptyEl) emptyEl.hidden = favs.length > 0;
  if (toolsEl) toolsEl.hidden = favs.length === 0;
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
