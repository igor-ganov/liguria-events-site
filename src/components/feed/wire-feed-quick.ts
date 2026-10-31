import { feedState } from './feed-state.ts';
import { paintFeedQuick } from './paint-feed-quick.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { quickKindOf } from '../../lib/quick/quick-kind-of.ts';
import { setFeedQuick } from './set-feed-quick.ts';

/** The quick filters (tonight, this weekend, Sunday evening): one at a time,
 *  and pressing the pressed one lets it go. */
export const wireFeedQuick = (refresh: () => void, today: string): void => {
  paintFeedQuick();
  queryAll(document, '[data-feed-quick]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const kind = quickKindOf(chip.dataset['feedQuick']);
      setFeedQuick([kind].filter((pressed) => pressed !== feedState.quick).at(0) ?? '', today);
      refresh();
    });
  });
};
