// The feed is server-rendered; this only filters (show/hide — no re-render) and
// appends events published since the build (from D1).
import { applyFeedFilter } from './apply-feed-filter.ts';
import { augmentFeed } from './augment-feed.ts';
import { buildFeedIndex } from './build-feed-index.ts';
import { DEFAULT_PAGE_DATA } from '../shared/default-page-data.ts';
import { feedToday } from './feed-today.ts';
import { readFeedParams } from './read-feed-params.ts';
import { readJsonIsland } from './read-json-island.ts';
import { reorderFeed } from './reorder-feed.ts';
import { runFeedSearch } from './run-feed-search.ts';
import { stampFeedOrder } from './stamp-feed-order.ts';
import { syncFeedUrl } from './sync-feed-url.ts';
import { unfoldFeed } from './unfold-feed.ts';
import { watchFeedFold } from './watch-feed-fold.ts';
import { wireFeedChips } from './wire-feed-chips.ts';
import { wireFeedDates } from './wire-feed-dates.ts';
import { wireFeedDescs } from './wire-feed-descs.ts';
import { wireFeedSearch } from './wire-feed-search.ts';
import { wireFeedSort } from './wire-feed-sort.ts';
import type { FeedContext } from './feed-context.ts';
import type { PageData } from '../../lib/i18n/ui-schema.ts';

const context = (): FeedContext => {
  const page = readJsonIsland<PageData>('ui-data', DEFAULT_PAGE_DATA);
  return {
    lang: page.lang,
    ui: page.ui,
    icons: readJsonIsland<Record<string, string>>('icons-data', {}),
    today: feedToday(),
  };
};

/** Wire the server-rendered feed: filters + late-published events. */
export const initFeed = (): void => {
  const feed = context();
  readFeedParams(feed.today);
  stampFeedOrder();
  buildFeedIndex(feed.lang);
  // The page opens with the nearest days; the rest are folded away until
  // something needs every event. An address that already filters does.
  const unfold = (): boolean => unfoldFeed(feed.lang);
  [location.search].filter((query) => query.length > 1).forEach(unfold);
  runFeedSearch();
  // Whatever the reader changed, it is answered over the whole feed: the fold
  // is opened first, and the search is run again now that it knows every day.
  const refresh = (): void => {
    unfold();
    runFeedSearch();
    applyFeedFilter();
    syncFeedUrl(feed.today);
  };
  wireFeedSearch(refresh);
  wireFeedDescs(feed.lang);
  wireFeedDates(refresh);
  wireFeedChips(refresh);
  wireFeedSort(feed.today, unfold);
  applyFeedFilter();
  reorderFeed();
  watchFeedFold(() => {
    unfold();
    applyFeedFilter();
    reorderFeed();
  });
  // The list was hidden up front on a filtered URL (see Layout.astro) to avoid
  // flashing the unfiltered static list; it is now filtered, so reveal it.
  document.documentElement.classList.remove('feed-filtering');
  void augmentFeed(feed);
};
