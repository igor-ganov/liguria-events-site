import { queryAll } from '../../lib/dom/query-all.ts';

/** The server renders each day's events unique-first (short span leads); that
 *  order is stamped onto every card so the default sort restores it exactly and
 *  "Newest first" can fall back to it as a tie-break. */
export const stampFeedOrder = (): void => {
  queryAll(document, '.feed-list').forEach((list) => {
    queryAll(list, ':scope > li').forEach((item, index) => {
      item.dataset['ord'] = String(index);
    });
  });
};
