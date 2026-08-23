import { regionOf } from '../region/region-of.ts';
import { slugify } from '../slugify.ts';
import type { CompactEvent } from './event-schema.ts';

/** The events held at one venue, matched on the slug so two spellings of the
 *  same theatre land on one page. */
export const eventsOfVenue = (
  events: readonly CompactEvent[],
  region: string,
  city: string,
  slug: string,
): readonly CompactEvent[] =>
  events.filter(
    (event) =>
      regionOf(event) === region && (event.ct ?? '') === city && slugify(event.v ?? '') === slug,
  );
