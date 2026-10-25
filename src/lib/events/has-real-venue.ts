import { isRealVenue } from './is-real-venue.ts';
import type { CompactEvent } from './event-schema.ts';

/** Whether an event is held at a venue that has a page of its own: a real
 *  venue, in a town — a venue page lives under its town. */
export const hasRealVenue = (event: CompactEvent): boolean =>
  (event.ct ?? '') !== '' && isRealVenue(event.v ?? '', event.ct ?? '');
