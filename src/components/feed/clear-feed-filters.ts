import { feedState } from './feed-state.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { setFeedQuick } from './set-feed-quick.ts';

const CHIPS = '[data-feed-cat], [data-feed-free], [data-feed-gems], [data-feed-made], [data-feed-holiday]';

/** Release every chip. A pressed quick filter owned the date range, so the
 *  range goes back to its default with it; a range picked by hand stays. */
export const clearFeedFilters = (refresh: () => void, today: string): void => {
  feedState.cats.clear();
  feedState.free = false;
  feedState.gems = false;
  feedState.made = false;
  feedState.holiday = '';
  [feedState.quick].filter((quick) => quick !== '').forEach(() => setFeedQuick('', today));
  queryAll(document, CHIPS).forEach((chip) => chip.setAttribute('aria-pressed', 'false'));
  refresh();
};
