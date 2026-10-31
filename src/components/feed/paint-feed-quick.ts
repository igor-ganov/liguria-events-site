import { feedState } from './feed-state.ts';
import { feedQueryString } from './feed-query-string.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { quickHref } from '../../lib/quick/quick-href.ts';
import { quickKindOf } from '../../lib/quick/quick-kind-of.ts';

// The filters a chip's page should open with: everything but the dates, which
// the quick filter it leads to sets for itself.
const carried = (): string => {
  const params = new URLSearchParams(feedQueryString(feedState, ''));
  ['from', 'to', 'when'].forEach((key) => params.delete(key));
  return params.toString();
};

/** Mark which quick filter is on — at most one. A toggle button says it is
 *  pressed; a link to a quick page says it is the page, and carries the other
 *  filters along to wherever it leads. */
export const paintFeedQuick = (): void => {
  const query = carried();
  queryAll(document, 'button[data-feed-quick]').forEach((chip) =>
    chip.setAttribute('aria-pressed', String(chip.dataset['feedQuick'] === feedState.quick)),
  );
  queryAll(document, 'a[data-feed-quick]').forEach((chip) => {
    const kind = quickKindOf(chip.dataset['feedQuick']);
    chip.removeAttribute('aria-current');
    [kind].filter((on) => on === feedState.quick).forEach(() => chip.setAttribute('aria-current', 'page'));
    [kind].filter((found) => found !== '').forEach((found) => chip.setAttribute('href', quickHref(feedState.base, found, feedState.quick, query)));
  });
};
