import { hereTarget } from '../../lib/region/here-target.ts';
import { locatedCities } from './located-cities.ts';
import { targetLink } from './target-link.ts';

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
const goTo = (list: HTMLElement, mode: 'city' | 'region', at: GeolocationPosition): void => {
  const target = hereTarget(mode, locatedCities(list), [at.coords.latitude, at.coords.longitude]);
  targetLink(list, target).forEach((link) => {
    window.location.href = link.href;
  });
};

/**
 * Resolve the visitor's position to a place in a list of regions and cities and
 * go there. The caller is handed the failure, because what to say about it is
 * its business.
 *
 * It takes the list rather than a whole picker: the header's dropdown and the
 * front page both have one, and this is the only part of either that a position
 * is measured against.
 */
export const locateHere = async (list: HTMLElement, mode: 'city' | 'region'): Promise<void> => {
  const at = await position();
  goTo(list, mode, at);
};
