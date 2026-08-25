import type { PreparedIndex } from '../../lib/search/index.ts';

/** How a day's cards are ordered: by date (the server's curated order) or
 *  newest first. */
export type FeedSort = 'date' | 'created';

/** Everything the feed is filtered and ordered by right now, plus the fuzzy
 *  index built from the rendered cards. */
export type FeedState = {
  from: string;
  to: string;
  readonly cats: Set<string>;
  free: boolean;
  gems: boolean;
  /** Only events made on the platform. */
  made: boolean;
  query: string;
  city: string;
  hits: ReadonlySet<string> | undefined;
  sort: FeedSort;
  index: PreparedIndex | undefined;
};

/** Module-level, so it survives an SPA swap — readFeedParams resets it, so a
 *  previous view never leaks into the next. */
export const feedState: FeedState = {
  from: '',
  to: '',
  cats: new Set<string>(),
  free: false,
  gems: false,
  made: false,
  query: '',
  city: '',
  hits: undefined,
  sort: 'date',
  index: undefined,
};
