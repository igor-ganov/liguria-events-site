import { feedState } from './feed-state.ts';
import { paintFeedQuick } from './paint-feed-quick.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { quickKindOf } from '../../lib/quick/quick-kind-of.ts';
import { setFeedQuick } from './set-feed-quick.ts';

/** The quick filters (tonight, this weekend, Sunday evening): one at a time,
 *  and pressing the pressed one lets it go. Where they are links to their
 *  pages, the whole feed still answers in place — every card a quick page
 *  would list is already here — and the address becomes the page's
 *  (feedUrl); anywhere else the link is followed. */
export const wireFeedQuick = (refresh: () => void, today: string): void => {
  paintFeedQuick();
  queryAll(document, '[data-feed-quick]')
    .filter((chip) => chip.tagName === 'BUTTON' || feedState.toggle)
    .forEach((chip) => {
      chip.addEventListener('click', (event) => {
        event.preventDefault();
        const kind = quickKindOf(chip.dataset['feedQuick']);
        setFeedQuick([kind].filter((pressed) => pressed !== feedState.quick).at(0) ?? '', today);
        refresh();
      });
    });
};
