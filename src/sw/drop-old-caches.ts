import { CACHE_NAME } from './cache-name.ts';
import { PAGES_CACHE } from './pages-cache-name.ts';

const KEEP = [CACHE_NAME, PAGES_CACHE];

/** Every cache but this version's two. Bumping a name is how a caching
 *  mistake that already shipped gets taken back from the browsers holding it. */
export const dropOldCaches = async (): Promise<void> => {
  const names = await caches.keys();
  await Promise.all(names.filter((name) => !KEEP.includes(name)).map((name) => caches.delete(name)));
};
