import { CACHE_NAME } from './cache-name.ts';
import { OFFLINE_URL } from './offline-url.ts';
import { fromStore } from './from-store.ts';
import { storePage } from './store-page.ts';
import type { KeepAlive } from './keep-alive.ts';

const offlinePage = async (): Promise<Response> =>
  (await (await caches.open(CACHE_NAME)).match(OFFLINE_URL)) ??
  new Response('Offline', { status: 503, headers: { 'content-type': 'text/plain' } });

/**
 * Pages: the network answers, and what it answers is kept.
 *
 * Network-first and never cache-first, because this site renders pages on the
 * server and a stored copy is by definition behind. The copy exists for the
 * one case where there is nothing else — no signal — and the page it serves is
 * marked as stored, so the reader is told rather than left to assume.
 *
 * What may be kept is decided by isCacheablePage, which keeps out everything
 * rendered for one person: this cache is shared by everyone on the device.
 */
export const networkFirst = (request: Request, keepAlive: KeepAlive): Promise<Response> =>
  fetch(request)
    .then((response) => {
      // The copy is taken HERE, synchronously, before the response is handed
      // over — once the page starts reading the body, clone() throws and the
      // cache silently stays empty.
      //
      // The writing itself is handed to keepAlive rather than awaited: cloning
      // and storing a page on every navigation would make the reader pay for
      // tomorrow's offline visit with today's. Not awaiting it at all is not
      // the alternative either — the browser may stop the worker the moment
      // the response is handed over.
      keepAlive(storePage(request, response.clone(), Date.now()));
      return response;
    })
    .catch(async () => (await fromStore(request)) ?? offlinePage());
