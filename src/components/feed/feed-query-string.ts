import type { FeedState } from './feed-state.ts';

type Param = readonly [string, string];

// Order matters: it is the order the query string reads in, and a shared URL
// should look the same whichever filter was touched first.
const params = (state: FeedState, today: string): readonly Param[] => [
  ...[state.query.trim()].filter((query) => query !== '').map((query): Param => ['q', query]),
  ...[[...state.cats].join(',')]
    .filter(() => state.cats.size > 0)
    .map((cats): Param => ['cats', cats]),
  ...[state.from]
    .filter((from) => from !== '' && from !== today)
    .map((from): Param => ['from', from]),
  ...[state.to].filter((to) => to !== '').map((to): Param => ['to', to]),
  ...[state.free].filter((free) => free).map((): Param => ['free', '1']),
  ...[state.gems].filter((gems) => gems).map((): Param => ['gems', '1']),
  ...[state.sort].filter((sort) => sort === 'created').map((): Param => ['sort', 'created']),
];

/** Filters live in the URL so a filtered view is shareable, bookmarkable and
 *  survives a reload. `from` is omitted while it equals today (the default), so
 *  a pristine feed keeps a clean URL. */
export const feedQueryString = (state: FeedState, today: string): string =>
  new URLSearchParams(params(state, today).map(([key, value]) => [key, value])).toString();
