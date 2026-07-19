import { decodeLandmarks } from './decode-landmarks.ts';
import type { Landmark } from './landmark-schema.ts';
import type { Locale } from '../i18n/locales.ts';

/** A Cloudflare Fetcher (the worker's ASSETS binding). */
type Assets = { fetch: (input: string) => Promise<Response> };

// Parsed once per warm isolate, then reused across requests (see places-source).
const cache = new Map<Locale, readonly Landmark[]>();

/** All landmarks for a locale, from the worker's own static asset (cached). */
export const landmarksFor = async (assets: Assets, lang: Locale): Promise<readonly Landmark[]> => {
  const hit = cache.get(lang);
  if (hit) return hit;
  const res = await assets.fetch(`https://assets.local/data/landmarks.${lang}.json`);
  const data = res.ok ? decodeLandmarks(await res.json()) : [];
  cache.set(lang, data);
  return data;
};
