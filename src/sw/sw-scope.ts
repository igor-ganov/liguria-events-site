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
  /** Keep the worker alive for work that outlives the response — storing a
   *  page, for one. Without it the browser may stop the worker the moment the
   *  response is handed over, and the copy is never written. */
  waitUntil: (work: Promise<unknown>) => void;
}>;

export type SwLifecycleEvent = Readonly<{ waitUntil: (work: Promise<unknown>) => void }>;

/** A page talking to the worker. `source` is the page that spoke, and the only
 *  one the answer belongs to. */
export type SwMessageEvent = Readonly<{
  data: unknown;
  source: SwClient | undefined;
  waitUntil: (work: Promise<unknown>) => void;
}>;

/** One open page. The worker answers through this — something newer behind
 *  what is on screen, a copy confirmed current, or no connection at all. */
export type SwClient = Readonly<{ postMessage: (message: unknown) => void }>;

export type SwScope = Readonly<{
  addEventListener: {
    (type: 'fetch', listener: (event: SwFetchEvent) => void): void;
    (type: 'message', listener: (event: SwMessageEvent) => void): void;
    (type: 'install' | 'activate', listener: (event: SwLifecycleEvent) => void): void;
  };
  skipWaiting: () => Promise<void>;
  clients: Readonly<{ claim: () => Promise<void> }>;
  location: Readonly<{ origin: string }>;
}>;
