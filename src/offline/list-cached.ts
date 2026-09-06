import { PAGES_CACHE } from '../sw/pages-cache-name.ts';
import { offlineLabel } from '../lib/pwa/offline-label.ts';

const link = (path: string): HTMLAnchorElement => {
  const anchor = document.createElement('a');
  anchor.href = path;
  anchor.textContent = offlineLabel(path);
  return anchor;
};

const paths = async (): Promise<readonly string[]> => {
  const cache = await caches.open(PAGES_CACHE);
  return (await cache.keys()).map((request) => new URL(request.url).pathname);
};

/**
 * Offer what is actually readable while there is no signal.
 *
 * The app's launch URL is "/", which redirects to a region and so is never
 * itself stored. Without this, somebody who had been reading the feed a minute
 * earlier opened the app and was told there was no connection — over a cache
 * that had the feed in it. Saying "nothing here" while holding the thing they
 * wanted is the worst version of an offline page.
 */
export const listCached = async (): Promise<void> => {
  const list = document.querySelector('[data-offline-list]');
  const found = await paths().catch(() => []);
  // appendChild, not append: with node types in scope the union on `append`
  // resolves to a fetch body and the call stops type-checking.
  found.forEach((path) => list?.appendChild(link(path)));
  [list]
    .filter((node): node is HTMLElement => node instanceof HTMLElement)
    .filter(() => found.length > 0)
    .forEach((node) => {
      node.hidden = false;
    });
};

void listCached();
