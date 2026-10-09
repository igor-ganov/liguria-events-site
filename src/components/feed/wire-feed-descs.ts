import { applyFeedFilter } from './apply-feed-filter.ts';
import { buildFeedIndex } from './build-feed-index.ts';
import { feedState } from './feed-state.ts';
import { loadFeedDescs } from './load-feed-descs.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { runFeedSearch } from './run-feed-search.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

const regionOf = (): string => document.querySelector('[data-feed-list]')?.getAttribute('data-region') ?? '';

// Once the descriptions are in hand the index is built again with them, and
// whatever is typed is searched again: a query that matched nothing by title
// may match now.
const learn = async (lang: Locale): Promise<void> => {
  const fresh = await loadFeedDescs(regionOf(), lang);
  [fresh].filter(Boolean).forEach(() => {
    buildFeedIndex(lang);
    runFeedSearch();
    applyFeedFilter();
  });
};

/**
 * Bring the descriptions the search matches when somebody is about to search:
 * the moment the box is focused, or at once on an address that already carries
 * a query. Nobody else pays for them.
 */
export const wireFeedDescs = (lang: Locale): void => {
  queryAll(document, '[data-feed-search]').forEach((box) => box.addEventListener('focus', () => void learn(lang)));
  [feedState.query].filter((query) => query !== '').forEach(() => void learn(lang));
};
