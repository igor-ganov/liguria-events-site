import { branch } from '../../lib/branch.ts';
import { feedQueryString } from './feed-query-string.ts';
import { QUICK_SLUGS } from '../../lib/quick/quick-slugs.ts';
import type { FeedState } from './feed-state.ts';

// A whole feed with quick pages moves to the page of the quick filter pressed,
// and back when it is let go; every other page keeps its own address.
const pathOf = (pathname: string, state: FeedState): string =>
  branch(state.toggle && state.base !== '')(
    () => `${state.base}${[state.quick].filter((quick) => quick !== '').map((quick) => `${QUICK_SLUGS[quick]}/`).join('')}`,
    () => pathname,
  );

/** The URL the current filters should be readable at — the bare path while
 *  nothing is filtered, so a pristine feed keeps no stray `?`. */
export const feedUrl = (pathname: string, state: FeedState, today: string): string => {
  const query = feedQueryString(state, today);
  return branch(query === '')(
    () => pathOf(pathname, state),
    () => `${pathOf(pathname, state)}?${query}`,
  );
};
