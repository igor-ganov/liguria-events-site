import { saysNoMore } from './says-no-more.ts';
import type { DescriptionPart } from '../description/description-outline.ts';

type Input = Readonly<{
  parts: readonly DescriptionPart[];
  /** The page shows a calendar of the event's dates. */
  dated: boolean;
  /** What the page already says about the place: venue, address, town. */
  place: readonly string[];
}>;

/**
 * Where each part of a description goes on the event page, so that nothing is
 * said twice.
 *
 * The page has widgets of its own for the dates and for the place. A written
 * programme folds under the calendar of dates rather than standing beside it;
 * "when" is that calendar again and is left out; "getting there" goes under
 * the map when it adds something to the address and nowhere when it does not.
 * Every other part is a card of its own, in the order it was written.
 */
export const eventWidgets = ({ parts, dated, place }: Input) => {
  const folded = new Set(['getting-there', ...['programme', 'when'].filter(() => dated)]);
  return {
    programme: parts.filter((part) => dated && part.type === 'programme').at(0),
    way: parts.filter((part) => part.type === 'getting-there' && !saysNoMore(part.plain, place)).at(0),
    cards: parts.filter((part) => !folded.has(part.type)),
  };
};
