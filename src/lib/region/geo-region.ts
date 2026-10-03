import { REGION_NAMES } from './regions.ts';

// Cloudflare names Italy's regions in English, and not the English anybody
// writes: Lombardy, Latium, Apulia, The Marches. Only the ones whose name
// differs from our slug need listing; the rest match once punctuation is gone.
const EXONYMS: Readonly<Record<string, string>> = {
  lombardy: 'lombardia',
  latium: 'lazio',
  tuscany: 'toscana',
  apulia: 'puglia',
  piedmont: 'piemonte',
  sicily: 'sicilia',
  sardinia: 'sardegna',
  aostavalley: 'valle-d-aosta',
  trentinosouthtyrol: 'trentino-alto-adige',
  trentinoaltoadige: 'trentino-alto-adige',
  friuliveneziagiulia: 'friuli-venezia-giulia',
  themarches: 'marche',
  emiliaromagna: 'emilia-romagna',
  valledaosta: 'valle-d-aosta',
};

const key = (name: string): string => name.toLowerCase().replace(/[^a-z]/g, '');

const SLUGS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.keys(REGION_NAMES).map((slug) => [key(slug), slug]),
);

/**
 * The region a reader is in, when that is one of ours.
 *
 * Cloudflare puts it on every request, which makes it the one fact about where
 * somebody is that costs nothing. A reader outside Italy has no region here —
 * the caller decides what to open for them.
 */
export const geoRegion = (
  cfRegion: string | undefined,
  country: string | undefined,
): string | undefined =>
  [cfRegion ?? '']
    .filter(() => country === 'IT')
    .map(key)
    .flatMap((name) => [EXONYMS[name], SLUGS[name]])
    .filter((slug): slug is string => slug !== undefined)
    .at(0);
