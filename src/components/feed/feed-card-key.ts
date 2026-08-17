import type { FeedCardKey } from './sort-feed-cards.ts';

const DAY_MS = 86_400_000;

/** Read a card's ordering keys off its `data-*`. The whole-day span (end −
 *  start) is 0 for a one-day event; shorter = more "unique", since it pins to a
 *  moment instead of running through the window, so it leads. This is the
 *  curation that makes the feed useful, not a date dump. */
export const feedCardKey = (item: HTMLElement): FeedCardKey => {
  const start = item.dataset['start'] ?? '';
  const end = item.dataset['end'] || start;
  return {
    ord: Number(item.dataset['ord'] ?? '9999'),
    created: Number(item.dataset['created'] ?? '0'),
    span: (Date.parse(end) - Date.parse(start)) / DAY_MS,
  };
};
