import { guardDoublePress } from './guard-double-press.ts';
import { keepTipsOffline } from './keep-tips-offline.ts';
import { preloadTips } from './preload-tips.ts';
import { watchNavigation } from './watch-navigation.ts';
import { watchPending } from './watch-pending.ts';
import { watchPresses } from './watch-presses.ts';

/** Loading feedback for the whole site: wired once, it outlives every
 *  ClientRouter swap because it listens on the document. */
export const initLoading = (): void => {
  guardDoublePress();
  watchPresses();
  watchPending();
  watchNavigation();
  keepTipsOffline();
  // Fired on the first page too, not only after a ClientRouter swap.
  document.addEventListener('astro:page-load', preloadTips);
};
