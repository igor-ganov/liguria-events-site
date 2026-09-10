import { PUSH_SETTINGS_KEY } from './push-settings-key.ts';

/**
 * The place and language this device asked to be woken about.
 *
 * Kept in the Cache API rather than localStorage because a service worker
 * cannot read localStorage, and it is written by the page when the reader
 * turns notifications on. A device with nothing stored is asked about the
 * whole country in English, which is what an unanswered question means
 * everywhere else on this site.
 */
export const pushSettings = async (): Promise<Readonly<{ place: string; lang: string }>> => {
  const cache = await caches.open(PUSH_SETTINGS_KEY);
  const stored = await cache.match(`https://dovego.it/${PUSH_SETTINGS_KEY}`);
  const value: unknown = await stored?.json().catch(() => undefined);
  const found = (value ?? {}) as Record<string, unknown>;
  return { place: String(found['place'] ?? ''), lang: String(found['lang'] ?? 'en') };
};
