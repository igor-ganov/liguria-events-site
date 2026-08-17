import { feedSortOf } from './feed-sort-of.ts';
import { feedState } from './feed-state.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { reorderFeed } from './reorder-feed.ts';
import { syncFeedUrl } from './sync-feed-url.ts';

const press = (buttons: readonly HTMLElement[], chosen: HTMLElement): void => {
  buttons.forEach((button) => button.setAttribute('aria-pressed', String(button === chosen)));
};

/** The sort buttons. Re-picking the current mode does nothing, so the list is
 *  never reshuffled for no reason. */
export const wireFeedSort = (today: string): void => {
  const buttons = queryAll(document, '[data-feed-sort]');
  buttons.forEach((button) => {
    const mode = feedSortOf(button.dataset['feedSort']);
    button.setAttribute('aria-pressed', String(feedState.sort === mode));
    button.addEventListener('click', () => {
      [mode]
        .filter((next) => next !== feedState.sort)
        .forEach((next) => {
          feedState.sort = next;
          press(buttons, button);
          reorderFeed();
          syncFeedUrl(today);
        });
    });
  });
};
