import { dropOldCaches } from './drop-old-caches.ts';
import { installPrecache } from './install-precache.ts';
import { isDefined } from '../lib/is-defined.ts';
import { respond } from './respond.ts';
import { handleMessage } from './handle-message.ts';
import type { SwFetchEvent, SwLifecycleEvent, SwMessageEvent, SwScope } from './sw-scope.ts';

// Bundled to public/sw.js by scripts/build-sw.ts. The declaration shadows the
// page-shaped `self` lib.dom provides; at runtime this is the worker scope.
declare const self: SwScope;

// skipWaiting with claim: a new worker takes over on the next load rather than
// waiting for every tab to close.
self.addEventListener('install', (event: SwLifecycleEvent) => {
  event.waitUntil(installPrecache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event: SwLifecycleEvent) => {
  event.waitUntil(dropOldCaches().then(() => self.clients.claim()));
});

/**
 * Answer, and keep the worker alive for the writing that follows.
 *
 * waitUntil is called HERE, synchronously, while the event is still being
 * dispatched — calling it later, from inside the promise that stores the page,
 * throws and the copy is never written.
 */
self.addEventListener('fetch', (event: SwFetchEvent) => {
  const keeping: Promise<unknown>[] = [];
  [respond(event.request, self.location.origin, (work) => void keeping.push(work))]
    .filter(isDefined)
    .forEach((response) => {
      event.respondWith(response);
      event.waitUntil(response.then(() => Promise.all(keeping)));
    });
});

/** A page asking for the links around it to be ready, or for what the worker
 *  found behind the copy it is showing. */
self.addEventListener('message', (event: SwMessageEvent) => {
  event.waitUntil(handleMessage(event.data, event.source, self.location.origin, Date.now()));
});
