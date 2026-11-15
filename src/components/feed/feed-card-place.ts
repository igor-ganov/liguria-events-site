import { escapeMarkup } from '../../lib/escape-markup.ts';
import { spriteUse } from '../../lib/icons/sprite-use.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

/**
 * The venue as a link to its page, placed right after the card's own link —
 * a link cannot sit inside another — and laid over the card's foot by CSS, so
 * it reads where the plain venue name used to. `href` is only ever a venue
 * page that exists (venueLink).
 */
export const feedCardPlace =
  (event: CompactEvent) =>
  (href: string): string =>
    `<a class="photo-card-venue photo-card-place" href="${escapeMarkup(href)}">` +
    `${spriteUse('pin', 14, 'ui-icon sprite-icon')}<span>${escapeMarkup(event.v ?? '')}</span></a>`;
