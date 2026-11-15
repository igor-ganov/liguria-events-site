import { isDefined } from '../../lib/is-defined.ts';
import { nextTip } from '../../lib/loading/next-tip.ts';
import { showOnCard } from './show-on-card.ts';
import { tipsStore } from './tips-store.ts';
import type { Tip } from '../../lib/loading/tip.ts';
import type { TipPhase } from './tip-phase.ts';

const phaseOf = (tip: Tip | undefined): TipPhase =>
  [tip].filter(isDefined).map((): TipPhase => 'tip').at(0) ?? 'waiting';

/** Put the next tip on the card — or the waiting dots, while none is in hand. */
export const rotateTip = (): void => {
  const { tip, cursor } = nextTip(tipsStore.tips, tipsStore.cursor);
  tipsStore.cursor = cursor;
  showOnCard(phaseOf(tip), tip?.text ?? '');
};
