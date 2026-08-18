import { hereTarget } from '../../lib/region/here-target.ts';
import { locatedCities } from './located-cities.ts';
import { targetLink } from './target-link.ts';
import type { RegionPickerParts } from './region-picker-parts.ts';

const position = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10_000,
      maximumAge: 300_000,
    }),
  );

// Nothing is selected until a place is actually resolved: a refused or failed
// lookup must leave the visitor on the place they already had.
const goTo = (parts: RegionPickerParts, mode: 'city' | 'region', at: GeolocationPosition): void => {
  const target = hereTarget(mode, locatedCities(parts.list), [
    at.coords.latitude,
    at.coords.longitude,
  ]);
  targetLink(parts.list, target).forEach((link) => {
    window.location.href = link.href;
  });
};

/** Resolve the visitor's position to a place in the list and go there. The
 *  caller is handed the failure, because what to say about it is its business. */
export const locateHere = async (
  parts: RegionPickerParts,
  mode: 'city' | 'region',
): Promise<void> => {
  const at = await position();
  goTo(parts, mode, at);
};
