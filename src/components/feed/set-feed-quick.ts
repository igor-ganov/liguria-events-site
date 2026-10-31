import { feedState } from './feed-state.ts';
import { paintFeedQuick } from './paint-feed-quick.ts';
import { quickWindow } from '../../lib/quick/quick-window.ts';
import { romeNow } from './rome-now.ts';
import { syncFeedDates } from './sync-feed-dates.ts';
import type { QuickKind } from '../../lib/quick/quick-kind.ts';

/**
 * Press a quick filter, or release it with ''. A quick filter owns the date
 * range — it is worked out from the Rome clock now and written into the date
 * inputs; releasing it puts the range back to the default (today, open end).
 */
export const setFeedQuick = (kind: QuickKind | '', today: string): void => {
  const window = [kind].filter((pressed) => pressed !== '').map((pressed) => quickWindow(pressed, romeNow())).at(0);
  feedState.quick = kind;
  feedState.window = window;
  feedState.from = window?.from ?? today;
  feedState.to = window?.to ?? '';
  syncFeedDates();
  paintFeedQuick();
};
