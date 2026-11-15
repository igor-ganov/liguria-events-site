import { fetchTips } from './fetch-tips.ts';
import { startCursor } from '../../lib/loading/start-cursor.ts';
import { tipsStore } from './tips-store.ts';
import type { Tip } from '../../lib/loading/tip.ts';

const keep = (tips: readonly Tip[]): readonly Tip[] => {
  Object.assign(tipsStore, { tips, cursor: startCursor(Math.random, tips.length), pending: undefined });
  return tips;
};

const fresh = (lang: string): Promise<readonly Tip[]> => {
  Object.assign(tipsStore, { lang, tips: [], pending: fetchTips(lang).then(keep) });
  return tipsStore.pending ?? Promise.resolve([]);
};

/** The tips of `lang`: the ones in hand, the fetch already under way, or a new
 *  fetch — also after one that brought nothing. Asked once a page has loaded,
 *  so a tip is in hand before the next load starts; asked again by a load that
 *  finds none. */
export const ensureTips = (lang: string): Promise<readonly Tip[]> =>
  [tipsStore]
    .filter((store) => store.lang === lang && (store.pending !== undefined || store.tips.length > 0))
    .map((store) => store.pending ?? Promise.resolve(store.tips))
    .at(0) ?? fresh(lang);
