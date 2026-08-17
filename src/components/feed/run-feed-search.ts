import { feedHits } from './feed-hits.ts';
import { feedState } from './feed-state.ts';

/** Re-run the fuzzy search for whatever is typed now. */
export const runFeedSearch = (): void => {
  feedState.hits = feedHits(feedState.index, feedState.query);
};
