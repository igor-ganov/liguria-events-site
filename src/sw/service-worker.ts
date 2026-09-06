import { dropOldCaches } from './drop-old-caches.ts';
import { installPrecache } from './install-precache.ts';
import { isDefined } from '../lib/is-defined.ts';
import { respond } from './respond.ts';
import type { SwFetchEvent, SwLifecycleEvent, SwScope } from './sw-scope.ts';

// Bundled to public/sw.js by scripts/build-sw.ts. The declaration shadows the
// page-shaped `self` lib.dom provides; at runtime this is the worker scope.
declare const self: SwScope;

// skipWaiting with claim: a new worker takes over on the next load rather than
// waiting for every tab to close. The routing table is written so that taking
// over early cannot serve a stale page.
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
 * throws and the copy is never written. That mistake looked exactly like a
 * caching bug and cost five specs a run to find.
 *
 * The handlers hand their background work to `keeping`; this waits for the
 * response first and then for all of it, so the browser may not stop the
 * worker until the copy is on disk.
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
