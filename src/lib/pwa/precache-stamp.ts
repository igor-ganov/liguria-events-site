import { createHash } from 'node:crypto';

/**
 * A short fingerprint of everything the worker precaches.
 *
 * It exists to change the worker's own bytes. A browser only reinstalls a
 * service worker when the worker FILE differs, and only an install refreshes
 * the precache — so a new offline page shipped on its own is downloaded by
 * nobody, and every device keeps serving the old one for as long as the worker
 * happens to stay identical. Caught on a device: a styling fix deployed, and
 * the phone kept showing the page from before it.
 */
export const precacheStamp = (contents: readonly string[]): string =>
  createHash('sha1').update(contents.join('\u0000')).digest('hex').slice(0, 8);
