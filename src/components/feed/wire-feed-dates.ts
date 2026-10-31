import { feedState } from './feed-state.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { releaseFeedQuick } from './release-feed-quick.ts';

const wireDate = (selector: string, key: 'from' | 'to', refresh: () => void): void => {
  [document.querySelector<HTMLInputElement>(selector) ?? undefined]
    .filter(isDefined)
    .forEach((input) => {
      input.value = feedState[key];
      input.addEventListener('change', () => {
        feedState[key] = input.value;
        releaseFeedQuick();
        refresh();
      });
    });
};

/** The two date bounds, restored from the URL. Picking one by hand lets go
 *  of a quick filter, which would otherwise own the range. */
export const wireFeedDates = (refresh: () => void): void => {
  wireDate('[data-feed-from]', 'from', refresh);
  wireDate('[data-feed-to]', 'to', refresh);
};
