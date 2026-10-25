import { branch } from '../branch.ts';
import { hasRealVenue } from './has-real-venue.ts';
import { localizedUrl } from '../i18n/localized-url.ts';
import { regionOf } from '../region/region-of.ts';
import { slugify } from '../slugify.ts';
import { venuePath } from './venue-path.ts';
import type { CompactEvent } from './event-schema.ts';
import type { Locale } from '../i18n/locales.ts';

/** The address of an event's venue page in one language, or nothing when the
 *  venue is not a place of its own ("various places", the town's name). */
export const venueLink =
  (lang: Locale) =>
  (event: CompactEvent): string | undefined =>
    branch(hasRealVenue(event))<string | undefined>(
      () => localizedUrl(lang, venuePath(regionOf(event), event.ct ?? '', slugify(event.v ?? ''))),
      () => undefined,
    );
