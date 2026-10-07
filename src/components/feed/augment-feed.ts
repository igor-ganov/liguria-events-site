import { applyFeedFilter } from './apply-feed-filter.ts';
import { buildFeedIndex } from './build-feed-index.ts';
import { decodeEventList } from '../../lib/events/decode-event-list.ts';
import { feedIds } from './feed-ids.ts';
import { insertFeedEvent } from './insert-feed-event.ts';
import { reorderFeed } from './reorder-feed.ts';
import { replaceFeedEvent } from './replace-feed-event.ts';
import { runFeedSearch } from './run-feed-search.ts';
import { unfoldFeed } from './unfold-feed.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { FeedContext } from './feed-context.ts';

type Late = Readonly<{ fresh: readonly CompactEvent[]; kept: readonly CompactEvent[] }>;

// Fresh: published since the build, so the feed lacks it. Kept: an event its
// organiser has taken over, replaced only where the feed shows it — a city's
// feed must not gain an event from another city this way.
const sorted = (extra: readonly CompactEvent[], held: ReadonlySet<string | undefined>): Late => ({
  fresh: extra.filter((event) => !held.has(event.id) && event.ow !== true),
  kept: extra.filter((event) => held.has(event.id) && event.ow === true),
});

// Anything to change is a change to the whole feed — a card may belong in a
// folded day — so the fold is opened first. With nothing to change the page is
// left exactly as it was built, fold and all.
const merge = (context: FeedContext, { fresh, kept }: Late): void => {
  unfoldFeed(context.lang);
  kept.forEach((event) => replaceFeedEvent(context, event));
  fresh.forEach((event) => insertFeedEvent(context, event));
  buildFeedIndex(context.lang);
  runFeedSearch();
  applyFeedFilter();
  reorderFeed();
};

/** Append the events published since the build and put organisers' versions in
 *  place of the crawler's. A failure keeps the server-rendered set. */
export const augmentFeed = async (context: FeedContext): Promise<void> => {
  try {
    const res = await fetch('/api/events/published.json', { headers: { accept: 'application/json' } });
    const late = sorted(decodeEventList(await res.json()), feedIds());
    [late].filter(({ fresh, kept }) => fresh.length + kept.length > 0).forEach((found) => merge(context, found));
  } catch {
    /* keep the server-rendered set */
  }
};
