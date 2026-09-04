import { CACHE_NAME } from './cache-name.ts';
import { OFFLINE_URL } from './offline-url.ts';

const offlinePage = async (): Promise<Response> =>
  (await (await caches.open(CACHE_NAME)).match(OFFLINE_URL)) ??
  new Response('Offline', { status: 503, headers: { 'content-type': 'text/plain' } });

/**
 * Pages. The network answers or nothing does.
 *
 * Nothing is stored here on purpose: this site renders pages on the server,
 * and some of them are rendered for the person signed in. A page kept from one
 * visit and replayed on the next is an event whose time may have changed — and,
 * on a shared device, somebody else's page. So an offline navigation gets the
 * offline page, and never a page from before.
 */
export const networkFirst = (request: Request): Promise<Response> => fetch(request).catch(offlinePage);
