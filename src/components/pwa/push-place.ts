import { locatedCities } from '../region/located-cities.ts';
import { placeNear } from '../../lib/region/place-near.ts';
import { placeToken } from '../../lib/region/place-token.ts';
import type { LocatedCity } from '../../lib/region/here-target.ts';

/** Eight seconds is longer than a fix takes indoors and short enough that a
 *  reader does not sit watching a spinner to turn a toggle on. */
const PATIENCE_MS = 8000;

/** The picker's city rows, which every page carries in its header: the same
 *  points the "near me" button measures against. Without them — a page with no
 *  picker — there is still a region. */
const cities = (): readonly LocatedCity[] =>
  [document.querySelector('[data-region-list]')]
    .filter((node): node is HTMLElement => node instanceof HTMLElement)
    .flatMap((list) => [...locatedCities(list)]);

const whereabouts = (): Promise<GeolocationPosition | undefined> =>
  new Promise<GeolocationPosition | undefined>((resolve) => {
    navigator.geolocation?.getCurrentPosition(
      (found) => resolve(found),
      () => resolve(undefined),
      { timeout: PATIENCE_MS, maximumAge: 3_600_000 },
    );
  }).catch(() => undefined);

/**
 * Which place to be woken about: the one the device is in, or the one the
 * reader last chose to look at.
 *
 * Position wins when there is one, because somebody who has travelled wants
 * tonight's town rather than last week's — and it resolves to the town itself
 * when one is near, not to the region: the sender answers `city:milano` with
 * 51 events tonight where `region:lombardia` is a count over 474 and a list
 * from anywhere in it.
 *
 * A refusal, a browser without geolocation, or a position too far from any town
 * we cover all fall back — asking to be told about somewhere is not a good
 * enough reason to demand a location.
 */
export const pushPlace = async (fallback: string): Promise<string> => {
  const position = await whereabouts();
  return [position]
    .filter((found) => found !== undefined)
    .map((found) => placeNear(cities(), [found.coords.latitude, found.coords.longitude]))
    .filter((place) => place !== '')
    .at(0) ?? placeToken(fallback);
};
