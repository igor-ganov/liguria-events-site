import type { FeedState } from './feed-state.ts';

/** Whether any chip narrows the feed — what the "clear" button is shown for.
 *  The date inputs alone do not count: clear has never reset them. */
export const feedFiltered = (state: FeedState): boolean =>
  state.cats.size > 0 || state.free || state.gems || state.made || state.quick !== '' || state.holiday !== '';
