import { markShut } from './mark-shut.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { readStored } from './read-stored.ts';
import { setDayShut } from './set-day-shut.ts';
import { SHUT_KEY } from './shut-key.ts';
import { shutDaysOf } from './shut-days-of.ts';
import { toggleFeedDay } from './toggle-feed-day.ts';
import { watchHeadHeight } from './watch-head-height.ts';

const held: { watcher?: MutationObserver } = {};

const mark = (): void => markShut(shutDaysOf(readStored(SHUT_KEY), ''), document, setDayShut);

/**
 * Wire the feed's days: their buttons (one listener — adding the same one again
 * on the next page is a no-op), the folded days that join the page later (the
 * folded-away tail, a day opened for an event published since the build), and
 * the height the headings stick under. The days on the page at load were folded
 * before they were painted (feedDaysBoot); marking them again changes nothing.
 */
export const wireFeedDays = (): void => {
  document.addEventListener('click', toggleFeedDay);
  mark();
  held.watcher?.disconnect();
  held.watcher = new MutationObserver(mark);
  queryAll(document, '[data-feed-list]').forEach((list) => held.watcher?.observe(list, { childList: true }));
  watchHeadHeight();
};
