import { feedSortOf } from './feed-sort-of.ts';
import type { FeedSort } from './feed-state.ts';

/** The filters a feed URL carries. */
export type FeedParams = {
  readonly query: string;
  readonly cats: readonly string[];
  readonly from: string;
  readonly to: string;
  readonly free: boolean;
  readonly gems: boolean;
  readonly sort: FeedSort;
};

/** Restore the filters from a query string. An absent `from` means the feed
 *  starts at today — the default a pristine URL stands for. */
export const parseFeedParams = (search: string, today: string): FeedParams => {
  const params = new URLSearchParams(search);
  return {
    query: params.get('q') ?? '',
    cats: (params.get('cats') ?? '').split(',').filter((cat) => cat !== ''),
    from: params.get('from') ?? today,
    to: params.get('to') ?? '',
    free: params.get('free') === '1',
    gems: params.get('gems') === '1',
    sort: feedSortOf(params.get('sort') ?? undefined),
  };
};
