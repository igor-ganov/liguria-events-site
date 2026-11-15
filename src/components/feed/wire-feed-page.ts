import { initFeed } from './init-feed.ts';
import { keepFeed } from './keep-feed.ts';

/**
 * Everything a feed page asks of the router, once per window. Back to a feed
 * through the router gives it back as it was left (keepFeed); any other arrival
 * wires the page the server sent (astro:page-load fires on first load AND after
 * each swap, so the filters and the sort are read from the address every time).
 */
export const wireFeedPage = (): void => {
  keepFeed();
  document.addEventListener('astro:page-load', initFeed);
};
