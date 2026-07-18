import { decodeLandmarks } from './decode-landmarks.ts';
import type { Landmark } from './landmark-schema.ts';
import type { Locale } from '../i18n/locales.ts';

const base = (import.meta.env?.BASE_URL ?? '').replace(/\/$/, '');

/** Fetch the current locale's landmark asset (built by scripts/build-landmarks).
 *  On demand only — nothing loads until the page opens or the map layer is on. */
export const loadLandmarks = async (lang: Locale): Promise<readonly Landmark[]> => {
  const res = await fetch(`${base}/data/landmarks.${lang}.json`, {
    headers: { accept: 'application/json' },
  });
  return decodeLandmarks(await res.json());
};
