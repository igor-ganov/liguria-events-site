import { branch } from '../../lib/branch.ts';
import { ensureTips } from './ensure-tips.ts';
import { tipCard } from './tip-card.ts';

type Schedule = (work: () => void) => void;

const IDLE: Schedule = (work) => {
  window.requestIdleCallback(() => work());
};

// Safari has no idle callback; a task later is the nearest it offers.
const SOON: Schedule = (work) => {
  window.setTimeout(work, 1);
};

const whenIdle: Schedule = (work) => branch('requestIdleCallback' in window)(() => IDLE, () => SOON)(work);

/** Once a page has loaded and the browser is idle, fetch the tips and the
 *  card's code, so both are in hand before the next load starts. */
export const preloadTips = (): void => {
  whenIdle(() => {
    // The card says when it has a tip in hand: what an offline reader can count on.
    void ensureTips(document.documentElement.lang).then((tips) => tipCard()?.toggleAttribute('data-tips-ready', tips.length > 0));
    void import('./loading-tip.ts');
  });
};
