import { CACHE_NAME } from './cache-name.ts';
import { OFFLINE_URL } from './offline-url.ts';

/**
 * The page shown when the device has no copy of what was asked for and cannot
 * reach the site.
 *
 * It is precached, so it is always there. The plain-text answer below is for
 * the one case where even that is missing — a worker whose install was
 * interrupted — and it exists so this never rejects: a rejected navigation is
 * the browser's own error page, over a device that may hold the rest of the
 * site and with no way back to it.
 */
export const offlinePage = async (): Promise<Response> =>
  (await (await caches.open(CACHE_NAME)).match(OFFLINE_URL)) ??
  new Response('Offline', { status: 503, headers: { 'content-type': 'text/plain' } });
