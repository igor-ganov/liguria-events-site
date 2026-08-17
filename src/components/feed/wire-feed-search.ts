import { feedState } from './feed-state.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { runFeedSearch } from './run-feed-search.ts';

/** The search box, restored from the URL and re-running the fuzzy search on
 *  every keystroke. */
export const wireFeedSearch = (refresh: () => void): void => {
  [document.querySelector<HTMLInputElement>('[data-feed-search]') ?? undefined]
    .filter(isDefined)
    .forEach((box) => {
      box.value = feedState.query;
      box.addEventListener('input', () => {
        feedState.query = box.value;
        runFeedSearch();
        refresh();
      });
    });
};
