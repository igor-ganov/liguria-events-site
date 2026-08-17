import { feedCardKey } from './feed-card-key.ts';
import { feedState } from './feed-state.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { sortFeedCards } from './sort-feed-cards.ts';

/** Reorder the cards WITHIN each day group, in place. */
export const reorderFeed = (): void => {
  queryAll(document, '.feed-list').forEach((list) => {
    const cards = queryAll(list, ':scope > li');
    sortFeedCards(feedState.sort, cards, feedCardKey).forEach((item) => list.appendChild(item));
  });
};
