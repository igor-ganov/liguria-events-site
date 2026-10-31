import type { FeedCardKey } from './sort-feed-cards.ts';

/** Read a card's ordering keys off its `data-*`: the hour it happens at (only
 *  a card in the timed part of a day carries one), the server's position and
 *  the first-seen time. */
export const feedCardKey = (item: HTMLElement): FeedCardKey => ({
  ord: Number(item.dataset['ord'] ?? '9999'),
  at: item.dataset['at'] ?? '',
  created: Number(item.dataset['created'] ?? '0'),
});
