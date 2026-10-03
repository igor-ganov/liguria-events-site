import { busiestRegion } from './busiest-region.ts';
import { cachedEvents } from '../../data/cached-events.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import { geoRegion } from './geo-region.ts';
import { isoToday } from '../calendar/iso-today.ts';
import { LEGACY_REGION } from './legacy-region.ts';
import type { Geo } from './geo.ts';

/**
 * Which region to open for a reader who has not named one.
 *
 * Their own, when Cloudflare says they are in Italy. Otherwise the one with the
 * most events still to come, which is a fact about the corpus rather than about
 * the site's history. The corpus is already loaded for every rendered page, so
 * this costs nothing on a request that is going to render anyway.
 */
export const entryRegion = async (geo: Geo): Promise<string> => {
  const own = geoRegion(geo.region, geo.country);
  const payload = await cachedEvents(EVENTS_URL).catch(() => undefined);
  return own ?? busiestRegion(payload?.events ?? [], isoToday()) ?? LEGACY_REGION;
};
