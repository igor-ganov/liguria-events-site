import type { FeedRow } from './matches-feed-row.ts';

/** Read a card's filter payload off its `data-*`. The server stamps it, so the
 *  client filters by showing and hiding — never by re-rendering. */
export const feedRowOf = (item: HTMLElement): FeedRow => ({
  id: item.dataset['id'] ?? '',
  start: item.dataset['start'] ?? '',
  end: item.dataset['end'] ?? item.dataset['start'] ?? '',
  free: item.dataset['free'] === '1',
  gem: item.dataset['gem'] === '1',
  city: item.dataset['ct'] ?? '',
  cats: (item.dataset['cats'] ?? '').split(','),
});
