import { isDefined } from '../../lib/is-defined.ts';
import { tipCard } from './tip-card.ts';
import type { TipPhase } from './tip-phase.ts';

/** Set what the card shows. Properties, not attributes: the element is Lit,
 *  and one set before the element is defined is picked up when it is. */
export const showOnCard = (phase: TipPhase, text: string): void => {
  [tipCard()].filter(isDefined).forEach((card) => Object.assign(card, { phase, text }));
};
