import { feedState } from './feed-state.ts';
import { feedUrl } from './feed-url.ts';
import { paintFeedQuick } from './paint-feed-quick.ts';

/** Write the filters to the address bar, and to the quick chips that lead to
 *  other pages with them. history.state is preserved — the ClientRouter keeps
 *  its navigation index there, and wiping it breaks back/forward (the
 *  swipe-back gesture needs several tries and then jumps past pages). */
export const syncFeedUrl = (today: string): void => {
  history.replaceState(history.state, '', feedUrl(location.pathname, feedState, today));
  paintFeedQuick();
};
