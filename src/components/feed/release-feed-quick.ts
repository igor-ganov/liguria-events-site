import { feedState } from './feed-state.ts';
import { paintFeedQuick } from './paint-feed-quick.ts';

/** A date picked by hand takes over from the quick filter: the filter lets go
 *  and the range stays as the reader left it. */
export const releaseFeedQuick = (): void => {
  feedState.quick = '';
  feedState.window = undefined;
  paintFeedQuick();
};
