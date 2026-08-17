import { placePath } from './place-path.ts';
import type { Place } from './place-schema.ts';

/** Canonical path of a place detail page, falling back to the region's places
 *  index when the slug matched nothing — so even a 404 has a sane canonical. */
export const placeDetailPath = (region: string, place?: Place): string =>
  [place].filter((p) => p !== undefined).map((p) => placePath(p.region, p.name, p.id))[0] ??
  `${region}/places/`;
