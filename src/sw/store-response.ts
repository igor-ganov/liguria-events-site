import { CACHE_NAME } from './cache-name.ts';

/** Keep a successful response and hand the original back untouched — a body
 *  can only be read once, so the cache gets the clone and the page the real one. */
export const storeResponse = async (request: Request, response: Response): Promise<Response> => {
  const cache = await caches.open(CACHE_NAME);
  await [response]
    .filter(({ ok }) => ok)
    .map((fresh) => cache.put(request, fresh.clone()))
    .at(0);
  return response;
};
