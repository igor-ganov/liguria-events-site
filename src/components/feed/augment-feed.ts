import { applyFeedFilter } from './apply-feed-filter.ts';
import { buildFeedIndex } from './build-feed-index.ts';
import { decodeEventList } from '../../lib/events/decode-event-list.ts';
import { insertFeedEvent } from './insert-feed-event.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { replaceFeedEvent } from './replace-feed-event.ts';
import { reorderFeed } from './reorder-feed.ts';
import { runFeedSearch } from './run-feed-search.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { FeedContext } from './feed-context.ts';

const onPage = (): ReadonlySet<string | undefined> => new Set(queryAll(document, '[data-feed-list] li').map((item) => item.dataset['id']));

// The static page may already carry an event D1 also knows about.
const unseen = (extra: readonly CompactEvent[], seen: ReadonlySet<string | undefined>): readonly CompactEvent[] =>
  extra.filter((event) => !seen.has(event.id) && event.ow !== true);

// An event its organiser has taken over is replaced only where the page shows
// it: a city's feed must not gain an event from another city this way.
const taken = (extra: readonly CompactEvent[], seen: ReadonlySet<string | undefined>): readonly CompactEvent[] =>
  extra.filter((event) => seen.has(event.id) && event.ow === true);

/** Append the events published since the build, put organisers' versions in
 *  place of the crawler's, then re-index, re-filter and
 *  re-order the whole feed. A failure keeps the server-rendered set. */
export const augmentFeed = async (context: FeedContext): Promise<void> => {
  try {
    const res = await fetch('/api/events/published.json', {
      headers: { accept: 'application/json' },
    });
    const extra = decodeEventList(await res.json());
    const seen = onPage();
    taken(extra, seen).forEach((event) => replaceFeedEvent(context, event));
    unseen(extra, seen).forEach((event) => insertFeedEvent(context, event));
    buildFeedIndex(context.lang);
    runFeedSearch();
    applyFeedFilter();
    reorderFeed();
  } catch {
    /* keep the server-rendered set */
  }
};
