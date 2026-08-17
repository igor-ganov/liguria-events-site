import type { FeedState } from './feed-state.ts';

/** One rendered card, as the filter reads it off the DOM. */
export type FeedRow = {
  readonly id: string;
  readonly start: string;
  readonly end: string;
  readonly free: boolean;
  readonly gem: boolean;
  readonly city: string;
  readonly cats: readonly string[];
};

type Rule = (state: FeedState, row: FeedRow) => boolean;

// Every rule passes an untouched filter, so a pristine feed shows everything.
// Dates are ISO strings, so a plain string comparison is chronological.
const RULES: readonly Rule[] = [
  (state, row) => state.hits === undefined || state.hits.has(row.id),
  (state, row) => state.to === '' || row.start <= state.to,
  (state, row) => state.from === '' || row.end >= state.from,
  (state, row) => !state.free || row.free,
  (state, row) => !state.gems || row.gem,
  (state, row) => state.city === '' || row.city === state.city,
  (state, row) => state.cats.size === 0 || row.cats.some((cat) => state.cats.has(cat)),
];

/** Whether a card survives the current filters — an event that runs across the
 *  window counts as being in it, not only one that starts inside it. */
export const matchesFeedRow = (state: FeedState, row: FeedRow): boolean =>
  RULES.every((rule) => rule(state, row));
