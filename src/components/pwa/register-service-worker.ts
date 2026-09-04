/**
 * Registration is deferred to the load event: the worker's install fetches the
 * offline page and an icon, and doing that while the page it is on is still
 * fetching its own assets makes the first visit slower for the sake of the
 * second one.
 *
 * A failure is swallowed. An unsupported or blocked service worker means the
 * site behaves exactly as it did before there was one, which is not an error
 * worth putting in front of anybody.
 */
export const registerServiceWorker = (): void => {
  addEventListener('load', () => {
    void navigator.serviceWorker?.register('/sw.js').catch(() => undefined);
  });
};
