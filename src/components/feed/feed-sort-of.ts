import type { FeedSort } from './feed-state.ts';

// A Map, not an object: the value comes off the URL or the DOM, and an
// inherited key ("constructor") must not read as a sort.
const SORTS = new Map<string, FeedSort>([['created', 'created']]);

/** Read a sort mode; anything but an explicit `created` is the default order. */
export const feedSortOf = (raw: string | undefined): FeedSort => SORTS.get(raw ?? '') ?? 'date';
