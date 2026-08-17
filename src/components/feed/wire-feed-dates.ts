import { feedState } from './feed-state.ts';
import { isDefined } from '../../lib/is-defined.ts';

const wireDate = (selector: string, key: 'from' | 'to', refresh: () => void): void => {
  [document.querySelector<HTMLInputElement>(selector) ?? undefined]
    .filter(isDefined)
    .forEach((input) => {
      input.value = feedState[key];
      input.addEventListener('change', () => {
        feedState[key] = input.value;
        refresh();
      });
    });
};

/** The two date bounds, restored from the URL. */
export const wireFeedDates = (refresh: () => void): void => {
  wireDate('[data-feed-from]', 'from', refresh);
  wireDate('[data-feed-to]', 'to', refresh);
};
