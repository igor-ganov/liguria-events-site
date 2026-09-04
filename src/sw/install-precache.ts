import { CACHE_NAME } from './cache-name.ts';
import { PRECACHE_URLS } from './precache-urls.ts';

/** Fill the cache during installation. One URL failing must not fail the
 *  install — a worker that refuses to install leaves the site with none. */
export const installPrecache = async (): Promise<void> => {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(PRECACHE_URLS.map((url) => cache.add(url).catch(() => undefined)));
};
