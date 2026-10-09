import { feedDescs } from './feed-descs.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

// One fetch per file for the life of the page, however many times the search
// box is touched; a file that failed is asked for again next time.
const asked = new Map<string, Promise<boolean>>();

const fetched = async (url: string): Promise<boolean> => {
  const descs: Readonly<Record<string, string>> = await (await fetch(url, { headers: { accept: 'application/json' } })).json();
  Object.entries(descs).forEach(([id, text]) => feedDescs.set(id, String(text)));
  return true;
};

const once = (url: string): Promise<boolean> => {
  const pending = fetched(url).catch(() => {
    asked.delete(url);
    return false;
  });
  asked.set(url, pending);
  return pending;
};

/**
 * Fetch what has been written about the region's events, so the search can
 * match it. Says whether there is anything new to index: false for a page with
 * no region, and for a file that could not be had — offline, the search goes
 * on matching titles, places and categories.
 */
export const loadFeedDescs = (region: string, lang: Locale): Promise<boolean> => {
  const url = `/data/search/${region}.${lang}.json`;
  // A file already asked for brings nothing new the second time.
  const again = asked.get(url)?.then(() => false);
  return [region].filter((slug) => slug !== '').map(() => again ?? once(url)).at(0) ?? Promise.resolve(false);
};
