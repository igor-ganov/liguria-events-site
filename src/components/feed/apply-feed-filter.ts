import { feedRowOf } from './feed-row-of.ts';
import { feedState } from './feed-state.ts';
import { matchesFeedRow } from './matches-feed-row.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { setHidden } from '../../lib/dom/set-hidden.ts';

const el = (selector: string): HTMLElement | undefined =>
  document.querySelector<HTMLElement>(selector) ?? undefined;

// A day heading with nothing left under it goes too.
const applyGroup = (group: HTMLElement): number => {
  const shown = queryAll(group, 'li')
    .map((item) => {
      const ok = matchesFeedRow(feedState, feedRowOf(item));
      item.hidden = !ok;
      return ok;
    })
    .filter((ok) => ok).length;
  group.hidden = shown === 0;
  return shown;
};

/** Filter the server-rendered feed in place: show/hide, no re-render. */
export const applyFeedFilter = (): void => {
  const visible = queryAll(document, '.feed-group')
    .map(applyGroup)
    .reduce((total, shown) => total + shown, 0);
  setHidden(el('[data-feed-empty]'), visible > 0);
  setHidden(
    el('[data-feed-clear]'),
    feedState.cats.size === 0 && !feedState.free && !feedState.gems,
  );
};
