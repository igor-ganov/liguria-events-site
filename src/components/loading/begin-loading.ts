import { announceBusy } from './announce-busy.ts';
import { clearBusy } from './clear-busy.ts';
import { holdTip } from './hold-tip.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { markBusy } from './mark-busy.ts';

const quietly = (): (() => void) => () => undefined;

const aloud = (): (() => void) => {
  announceBusy(true);
  const releaseTip = holdTip(document.documentElement.lang);
  return () => {
    announceBusy(false);
    releaseTip();
  };
};

/**
 * A load has begun. `source`, when there is one, shows it is busy and refuses a
 * second press. A load somebody asked for (`asked`) is also announced and gets
 * a tip if it runs long; one the page started by itself — late events, the end
 * of a list fetched ahead of the reader — only marks what it is filling, so a
 * reader who did nothing is not talked to. Returns the end of it all.
 */
export const beginLoading = (source: Element | undefined, asked: boolean): (() => void) => {
  const sources = [source].filter(isDefined);
  sources.forEach(markBusy);
  const release = [asked].filter(Boolean).map(aloud).at(0) ?? quietly();
  return () => {
    sources.forEach(clearBusy);
    release();
  };
};
