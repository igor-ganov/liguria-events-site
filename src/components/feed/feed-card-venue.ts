import { branch } from '../../lib/branch.ts';
import { escapeMarkup } from '../../lib/escape-markup.ts';
import { uiIcon } from '../../lib/icons/ui-icon.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

/** Where it is, beside a pin — or nothing at all when the source did not say. */
export const feedCardVenue = (event: CompactEvent): string =>
  branch(event.v === undefined)(
    () => '',
    () => `<span class="photo-card-venue">${uiIcon('pin', 14)}<span>${escapeMarkup(event.v ?? '')}</span></span>`,
  );
