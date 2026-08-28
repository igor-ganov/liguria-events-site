import { cardWhen } from './card-when.ts';
import { titleOf } from '../events/title-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { OgCard } from './og-card-svg.ts';

/** What of an event belongs on the card somebody's friends will see. */
export const eventCard = (event: CompactEvent): OgCard => ({
  title: titleOf('en')(event),
  when: cardWhen(event),
  place: event.v ?? '',
  madeHere: event.pl === true,
});
