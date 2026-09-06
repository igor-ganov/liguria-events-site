/**
 * Ask the worker what became of the copy this page is showing, and listen for
 * the answer.
 *
 * The page asks rather than waiting to be told: while the worker answers a
 * navigation, this document does not exist yet and is not a client, so an
 * answer sent at that moment reaches the page being left and nobody else.
 *
 * `startMessages` is not optional either — messages from the worker are queued
 * until a page either sets `onmessage` or asks for them, and addEventListener
 * alone does neither.
 */
export const askWorker = (url: string, onOutcome: (kind: string) => void): void => {
  navigator.serviceWorker?.addEventListener('message', (event: MessageEvent) => {
    const message: unknown = event.data;
    [String(Reflect.get(Object(message), 'url') ?? '')]
      .filter((sent) => sent === url)
      .forEach(() => onOutcome(String(Reflect.get(Object(message), 'kind') ?? '')));
  });
  navigator.serviceWorker?.startMessages();
  navigator.serviceWorker?.controller?.postMessage({ kind: 'state', url });
};
