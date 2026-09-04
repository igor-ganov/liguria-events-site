/**
 * The worker globals this file set uses, declared here because the project
 * compiles against lib.dom — which has no ServiceWorkerGlobalScope in it. A
 * narrow hand-written surface beats widening the whole project's lib to
 * WebWorker, which would then let every browser file reference things that do
 * not exist in a page.
 */
export type SwFetchEvent = Readonly<{
  request: Request;
  respondWith: (response: Promise<Response>) => void;
}>;

export type SwLifecycleEvent = Readonly<{ waitUntil: (work: Promise<unknown>) => void }>;

export type SwScope = Readonly<{
  addEventListener: {
    (type: 'fetch', listener: (event: SwFetchEvent) => void): void;
    (type: 'install' | 'activate', listener: (event: SwLifecycleEvent) => void): void;
  };
  skipWaiting: () => Promise<void>;
  clients: Readonly<{ claim: () => Promise<void> }>;
  location: Readonly<{ origin: string }>;
}>;
