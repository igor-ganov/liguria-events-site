/** What this device keeps under `key`; nothing when storage is unavailable
 *  (private modes, blocked cookies) — the page works without it.
 *  Self-contained: it is also printed into the page (feedDaysBoot). */
export const readStored = (key: string): string | undefined => {
  try {
    return localStorage.getItem(key) ?? undefined;
  } catch {
    return undefined;
  }
};
