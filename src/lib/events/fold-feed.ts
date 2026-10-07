import type { DayGroup } from './feed-day-groups.ts';

export type FoldedFeed = Readonly<{ head: readonly DayGroup[]; tail: readonly DayGroup[] }>;

// How many cards stand before each day: the fold falls at the first day that
// already has `least` of them ahead of it.
const before = (groups: readonly DayGroup[]): readonly number[] =>
  groups.map((_, index) => groups.slice(0, index).reduce((count, [, events]) => count + events.length, 0));

/**
 * Split a feed into the days a page renders at once and the days it keeps
 * folded away. The fold never falls inside a day: the head takes whole days
 * until it holds at least `least` cards, and everything after is the tail.
 */
export const foldFeed = (groups: readonly DayGroup[], least: number): FoldedFeed => {
  const ahead = before(groups);
  return {
    head: groups.filter((_, index) => (ahead[index] ?? 0) < least),
    tail: groups.filter((_, index) => (ahead[index] ?? 0) >= least),
  };
};
