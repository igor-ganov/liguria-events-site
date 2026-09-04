import { CACHE_NAME } from './cache-name.ts';
import { storeResponse } from './store-response.ts';

const refresh = (request: Request): Promise<Response | undefined> =>
  fetch(request)
    .then((response) => storeResponse(request, response))
    .catch(() => undefined);

/** For the shard data: answer from the cache immediately, and let the next
 *  visit have the newer copy. The refresh is deliberately not awaited on a hit. */
export const staleWhileRevalidate = async (request: Request): Promise<Response> => {
  const hit = await (await caches.open(CACHE_NAME)).match(request);
  const fresh = refresh(request);
  return hit ?? (await fresh) ?? new Response('', { status: 504 });
};
