import { dropOldCaches } from './drop-old-caches.ts';
import { installPrecache } from './install-precache.ts';
import { isDefined } from '../lib/is-defined.ts';
import { respond } from './respond.ts';
import { handleMessage } from './handle-message.ts';
import { pushSettings } from './push-settings.ts';
import { showDigest } from './show-digest.ts';
import type {
  SwFetchEvent,
  SwLifecycleEvent,
  SwMessageEvent,
  SwNotificationEvent,
  SwPushEvent,
  SwScope,
} from './sw-scope.ts';

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

/** Once a day, if somebody asked for it. The message is empty on purpose — see
 *  showDigest for where the words come from. */
self.addEventListener('push', (event: SwPushEvent) => {
  event.waitUntil(
    pushSettings().then(({ place, lang }) =>
      showDigest((title, options) => self.registration.showNotification(title, options), place, lang),
    ),
  );
});

/** A tap opens the page the notification was about. */
self.addEventListener('notificationclick', (event: SwNotificationEvent) => {
  event.notification.close();
  const url = String((event.notification.data as Record<string, unknown> | undefined)?.['url'] ?? '/');
  event.waitUntil(self.clients.openWindow(url));
});
