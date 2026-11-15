import { branch } from '../../lib/branch.ts';
import { escapeMarkup } from '../../lib/escape-markup.ts';
import { spriteUse } from '../../lib/icons/sprite-use.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

/** Where it is, beside a pin, inside the card — or nothing at all when the
 *  source did not say, or when the venue has a page and is linked beside the
 *  card instead (feedCardPlace). */
export const feedCardVenue = (event: CompactEvent, linked: boolean): string =>
  branch(event.v === undefined || linked)(
    () => '',
    () => `<span class="photo-card-venue">${spriteUse('pin', 14, 'ui-icon sprite-icon')}<span>${escapeMarkup(event.v ?? '')}</span></span>`,
  );
