import { branch } from '../../lib/branch.ts';
import { feedQueryString } from './feed-query-string.ts';
import type { FeedState } from './feed-state.ts';

/** The URL the current filters should be readable at — the bare path while
 *  nothing is filtered, so a pristine feed keeps no stray `?`. */
export const feedUrl = (pathname: string, state: FeedState, today: string): string => {
  const query = feedQueryString(state, today);
  return branch(query === '')(
    () => pathname,
    () => `${pathname}?${query}`,
  );
};
