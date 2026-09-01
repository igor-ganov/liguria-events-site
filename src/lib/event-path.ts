import { eventSlug } from './events/event-slug.ts';
import type { EventAddress } from './events/event-slug.ts';

/** In-site path of an event detail page, for localizedUrl(lang, …).
 *  Takes the event rather than its id: the address is built from what the
 *  event says, so every link on the site spells it the same way. */
export const eventPath = (event: EventAddress): string => `event/${eventSlug(event)}/`;
