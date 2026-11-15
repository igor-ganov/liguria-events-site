import { ensureTips } from './ensure-tips.ts';
import { rotateTip } from './rotate-tip.ts';
import { TIP_ROTATE_MS } from '../../lib/loading/tip-rotate-ms.ts';
import { TIP_THRESHOLD_MS } from '../../lib/loading/tip-threshold-ms.ts';
import { tipDue } from '../../lib/loading/tip-due.ts';
import { tipSession } from './tip-session.ts';
import { tipsStore } from './tips-store.ts';

const running = (): boolean => tipSession.active > 0;

/** Called when the threshold has passed: a load still running gets a tip, or
 *  the waiting dots and a fetch for the tips when none are in hand. */
export const showTip = (lang: string) => (): void => {
  [tipSession]
    .filter((session) => running() && tipDue(TIP_THRESHOLD_MS)(performance.now() - session.since))
    .forEach((session) => {
      const empty = tipsStore.tips.length === 0;
      void import('./loading-tip.ts');
      rotateTip();
      session.rotate = window.setInterval(rotateTip, TIP_ROTATE_MS);
      void ensureTips(lang).then(() => [empty].filter((was) => was && running()).forEach(rotateTip));
    });
};
