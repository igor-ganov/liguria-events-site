import { CACHE_NAME } from './cache-name.ts';

/** Every cache but this version's. Bumping CACHE_NAME is how a caching mistake
 *  that already shipped gets taken back from the browsers holding it. */
export const dropOldCaches = async (): Promise<void> => {
  const names = await caches.keys();
  await Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
};
