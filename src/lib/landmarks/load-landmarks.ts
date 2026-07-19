import { decodeLandmarks } from './decode-landmarks.ts';
import type { Landmark } from './landmark-schema.ts';
import type { Locale } from '../i18n/locales.ts';

const base = (import.meta.env?.BASE_URL ?? '').replace(/\/$/, '');

/** Fetch one region's landmark shard for a locale (scripts/build-landmarks).
 *  On demand only — the map loads a region's shard when its bbox enters view.
 *  A missing shard (region not built yet) resolves to empty, never throws. */
export const loadLandmarks = async (region: string, lang: Locale): Promise<readonly Landmark[]> => {
  const res = await fetch(`${base}/data/landmarks/${region}.${lang}.json`, {
    headers: { accept: 'application/json' },
  });
  return res.ok ? decodeLandmarks(await res.json(), region) : [];
};
