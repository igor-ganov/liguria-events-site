import { PAGES_CACHE } from './pages-cache-name.ts';
import { isCacheablePage } from './is-cacheable-page.ts';
import { stampedResponse } from './stamped-response.ts';

/**
 * Keep a page, if it is one that belongs to everybody.
 *
 * Only a plain 200 from this origin: a redirect, a 404 and a 500 are all
 * answers that must not be replayed tomorrow, and an opaque response has no
 * body to replay anyway.
 *
 * The response handed in is a COPY, taken before the page began reading the
 * original. Cloning here instead would be too late: by the time this runs the
 * browser is already streaming the body to the page, and the clone throws.
 * That is not a caching bug that announces itself — the cache simply stays
 * empty.
 */
export const storePage = async (request: Request, response: Response, nowMs: number): Promise<void> => {
  const cacheable =
    response.ok && response.type === 'basic' && isCacheablePage(new URL(request.url).pathname);
  await Promise.all(
    [cacheable]
      .filter(Boolean)
      .map(async () => (await caches.open(PAGES_CACHE)).put(request, await stampedResponse(response, nowMs))),
  );
};
