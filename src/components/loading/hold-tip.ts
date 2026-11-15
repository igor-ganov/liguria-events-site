import { showOnCard } from './show-on-card.ts';
import { showTip } from './show-tip.ts';
import { TIP_THRESHOLD_MS } from '../../lib/loading/tip-threshold-ms.ts';
import { tipSession } from './tip-session.ts';

const stop = (): void => {
  window.clearTimeout(tipSession.due);
  window.clearInterval(tipSession.rotate);
  showOnCard('idle', '');
};

const start = (lang: string): void => {
  tipSession.since = performance.now();
  tipSession.due = window.setTimeout(showTip(lang), TIP_THRESHOLD_MS);
};

/**
 * A load has begun: the tip is due once the threshold passes, unless every
 * load has ended by then. Returns the release, which is safe to call twice.
 * Nothing here waits for anything — the load itself is never held up.
 */
export const holdTip = (lang: string): (() => void) => {
  tipSession.active += 1;
  [tipSession.active].filter((count) => count === 1).forEach(() => start(lang));
  const held = { on: true };
  return () => {
    [held].filter((hold) => hold.on).forEach((hold) => {
      hold.on = false;
      tipSession.active -= 1;
      [tipSession.active].filter((count) => count === 0).forEach(stop);
    });
  };
};
