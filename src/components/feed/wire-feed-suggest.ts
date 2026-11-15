import { queryAll } from '../../lib/dom/query-all.ts';

const load = (): void => void import('../suggest/search-suggest.ts');

/**
 * The suggestions popup is loaded the first time the search box is touched,
 * not with the page: the feed ships without the Lit runtime, and most readers
 * never search. Once defined, the element upgrades by itself on every later
 * page of the visit.
 */
export const wireFeedSuggest = (): void =>
  queryAll(document, 'search-suggest').forEach((box) =>
    ['focusin', 'pointerdown'].forEach((type) => box.addEventListener(type, load, { once: true })),
  );
