import { PAGES_CACHE } from '../../sw/pages-cache-name.ts';

/**
 * Throw away every page kept for offline reading.
 *
 * Called when the person using the device changes — signing in, signing out.
 * The cache holds pages that belong to everybody, but "everybody" is decided
 * per page and the rule can only ever be as good as its author; emptying it at
 * the one moment the viewer changes costs a reload and removes the whole class
 * of "somebody else's page".
 */
export const forgetCachedPages = async (): Promise<void> => {
  await caches?.delete(PAGES_CACHE).catch(() => undefined);
};
