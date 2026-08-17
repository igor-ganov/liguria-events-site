import type { FeedSort } from './feed-state.ts';

/** What a card is ordered by: its server-rendered position, when it was first
 *  seen, and how many days it runs for. */
export type FeedCardKey = {
  readonly ord: number;
  readonly created: number;
  readonly span: number;
};

type Compare = (a: FeedCardKey, b: FeedCardKey) => number;

// "By date" lifts the short, time-pinned events above the long multi-week runs —
// the exact order the server already emits, so the first load never reflows.
// "Newest first" orders by first-seen time, falling back to that same order.
const COMPARE: Readonly<Record<FeedSort, Compare>> = {
  created: (a, b) => b.created - a.created || a.ord - b.ord,
  date: (a, b) => a.span - b.span || a.ord - b.ord,
};

/** Order one day's cards. Grouping (the day headings) is untouched. */
export const sortFeedCards = <T>(
  sort: FeedSort,
  cards: readonly T[],
  key: (card: T) => FeedCardKey,
): readonly T[] => [...cards].sort((a, b) => COMPARE[sort](key(a), key(b)));
