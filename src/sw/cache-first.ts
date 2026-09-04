import { CACHE_NAME } from './cache-name.ts';
import { storeResponse } from './store-response.ts';

/** For content-hashed and long-lived assets: whatever is stored is by
 *  definition still correct, so the network is only consulted on a miss. */
export const cacheFirst = async (request: Request): Promise<Response> =>
  (await (await caches.open(CACHE_NAME)).match(request)) ??
  storeResponse(request, await fetch(request));
