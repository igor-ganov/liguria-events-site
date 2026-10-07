import { branch } from '../../lib/branch.ts';
import { escapeMarkup } from '../../lib/escape-markup.ts';
import { spriteUse } from '../../lib/icons/sprite-use.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

/** Where it is, beside a pin — or nothing at all when the source did not say. */
export const feedCardVenue = (event: CompactEvent): string =>
  branch(event.v === undefined)(
    () => '',
    () => `<span class="photo-card-venue">${spriteUse('pin', 14, 'ui-icon sprite-icon')}<span>${escapeMarkup(event.v ?? '')}</span></span>`,
  );
