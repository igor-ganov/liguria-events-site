import { applyFeedFilter } from './apply-feed-filter.ts';
import { buildFeedIndex } from './build-feed-index.ts';
import { decodeEventList } from '../../lib/events/decode-event-list.ts';
import { insertFeedEvent } from './insert-feed-event.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { reorderFeed } from './reorder-feed.ts';
import { runFeedSearch } from './run-feed-search.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { FeedContext } from './feed-context.ts';

// The static page may already carry an event D1 also knows about.
const unseen = (extra: readonly CompactEvent[]): readonly CompactEvent[] => {
  const seen = new Set(queryAll(document, '[data-feed-list] li').map((item) => item.dataset['id']));
  return extra.filter((event) => !seen.has(event.id));
};

/** Append the events published since the build, then re-index, re-filter and
 *  re-order the whole feed. A failure keeps the server-rendered set. */
export const augmentFeed = async (context: FeedContext): Promise<void> => {
  try {
    const res = await fetch('/api/events/published.json', {
      headers: { accept: 'application/json' },
    });
    unseen(decodeEventList(await res.json())).forEach((event) => insertFeedEvent(context, event));
    buildFeedIndex(context.lang);
    runFeedSearch();
    applyFeedFilter();
    reorderFeed();
  } catch {
    /* keep the server-rendered set */
  }
};
