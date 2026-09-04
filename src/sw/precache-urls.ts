import { OFFLINE_URL } from './offline-url.ts';

/**
 * Fetched during installation, so that the first time the network is gone
 * there is already something to show.
 *
 * It is this short deliberately. Every page here is one the worker promises to
 * serve while offline, and a server-rendered page is a promise it cannot keep.
 * /offline/ is standalone with its styles inline — nothing it needs can be
 * missing from the cache, because it needs nothing.
 */
export const PRECACHE_URLS: readonly string[] = [OFFLINE_URL, '/icons/icon-192.png'];
