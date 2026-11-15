// The feed is server-rendered; this only filters (show/hide — no re-render) and
// appends events published since the build (from D1).
import { applyFeedFilter } from './apply-feed-filter.ts';
import { augmentFeed } from './augment-feed.ts';
import { buildFeedIndex } from './build-feed-index.ts';
import { DEFAULT_PAGE_DATA } from '../shared/default-page-data.ts';
import { feedRest } from './feed-rest.ts';
import { feedToday } from './feed-today.ts';
import { openFeed } from './open-feed.ts';
import { readFeedParams } from './read-feed-params.ts';
import { readJsonIsland } from './read-json-island.ts';
import { reorderFeed } from './reorder-feed.ts';
import { runFeedSearch } from './run-feed-search.ts';
import { stampFeedOrder } from './stamp-feed-order.ts';
import { syncFeedUrl } from './sync-feed-url.ts';
import { watchFeedFold } from './watch-feed-fold.ts';
import { wholeFeed } from './whole-feed.ts';
import { wireFeedChips } from './wire-feed-chips.ts';
import { wireFeedDates } from './wire-feed-dates.ts';
import { wireFeedDescs } from './wire-feed-descs.ts';
import { wireFeedHoliday } from './wire-feed-holiday.ts';
import { wireFeedQuick } from './wire-feed-quick.ts';
import { wireFeedSearch } from './wire-feed-search.ts';
import { wireFeedSort } from './wire-feed-sort.ts';
import { wireFeedSuggest } from './wire-feed-suggest.ts';
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

const wireFeed = (): void => {
  const feed = context();
  readFeedParams(feed.today);
  stampFeedOrder();
  buildFeedIndex(feed.lang);
  // The page opens with the nearest days; the rest are folded away until
  // something needs every event. An address that already filters does.
  const whole = wholeFeed(feed.lang);
  runFeedSearch();
  // Whatever the reader changed, it is answered over the whole feed: the fold
  // is opened first, and the search is run again now that it knows every day.
  const refresh = (): void =>
    whole(() => {
      runFeedSearch();
      applyFeedFilter();
      syncFeedUrl(feed.today);
    });
  wireFeedSearch(refresh);
  wireFeedSuggest();
  wireFeedDescs(feed.lang);
  wireFeedDates(refresh);
  wireFeedChips(refresh, feed.today);
  wireFeedQuick(refresh, feed.today);
  wireFeedHoliday(refresh);
  wireFeedSort(feed.today, feedRest(feed.lang));
  // The list was hidden up front on a filtered URL (see FeedFilterInit) to
  // avoid flashing the unfiltered static list; once filtered it is revealed.
  const show = (): void => {
    runFeedSearch();
    applyFeedFilter();
    reorderFeed();
    document.documentElement.classList.remove('feed-filtering');
  };
  openFeed(whole, show, augmentFeed(feed));
  watchFeedFold(() => whole(show));
};

/** Wire the server-rendered feed: filters + late-published events. Once: a
 *  feed the router has brought back as it was left (keepFeed) is wired already,
 *  and wiring it again would answer every chip twice. */
export const initFeed = (): void =>
  [document.querySelector('[data-feed-list]')]
    .filter((list) => list?.hasAttribute('data-feed-ready') !== true)
    .forEach((list) => {
      list?.setAttribute('data-feed-ready', '');
      wireFeed();
    });
