import type { FeedSort } from './feed-state.ts';

/** What a card is ordered by: its server-rendered position, the hour it
 *  happens at ('' when it is on all day) and when it was first seen. */
export type FeedCardKey = {
  readonly ord: number;
  readonly at: string;
  readonly created: number;
};

type Compare = (a: FeedCardKey, b: FeedCardKey) => number;

// "By date" is the clock: the exact order the server already emits (by the
// hour, ties as the server broke them), so the first load never reflows; a card
// published since the build finds its hour. "Newest first" orders by first-seen
// time, falling back to that same order.
const COMPARE: Readonly<Record<FeedSort, Compare>> = {
  created: (a, b) => b.created - a.created || a.ord - b.ord,
  date: (a, b) => a.at.localeCompare(b.at) || a.ord - b.ord,
};

/** Order one list of a day's cards. Grouping (the day headings) is untouched. */
export const sortFeedCards = <T>(
  sort: FeedSort,
  cards: readonly T[],
  key: (card: T) => FeedCardKey,
): readonly T[] => [...cards].sort((a, b) => COMPARE[sort](key(a), key(b)));
