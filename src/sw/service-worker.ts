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

self.addEventListener('fetch', (event: SwFetchEvent) => {
  [respond(event.request, self.location.origin)]
    .filter(isDefined)
    .forEach((response) => event.respondWith(response));
});
