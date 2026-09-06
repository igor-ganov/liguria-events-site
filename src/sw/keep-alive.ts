/**
 * Keep the worker alive until this work finishes.
 *
 * The fetch event's own waitUntil, passed down rather than reached for: the
 * handlers must not know what an event is, and the one thing they need from it
 * is the promise that the browser will not stop them halfway through writing.
 */
export type KeepAlive = (work: Promise<unknown>) => void;
