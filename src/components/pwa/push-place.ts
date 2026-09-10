import { regionAt } from '../../lib/region/region-at.ts';

/** Eight seconds is longer than a fix takes indoors and short enough that a
 *  reader does not sit watching a spinner to turn a toggle on. */
const PATIENCE_MS = 8000;

/**
 * Which region to be woken about: the one the device is in, or the one the
 * reader last chose to look at.
 *
 * Position wins when there is one, because somebody who has travelled wants
 * tonight's town rather than last week's. A refusal, a browser without
 * geolocation, or a position outside the country all fall back — asking to be
 * told about somewhere is not a good enough reason to demand a location.
 */
export const pushPlace = async (fallback: string): Promise<string> => {
  const position = await new Promise<GeolocationPosition | undefined>((resolve) => {
    navigator.geolocation?.getCurrentPosition(
      (found) => resolve(found),
      () => resolve(undefined),
      { timeout: PATIENCE_MS, maximumAge: 3_600_000 },
    );
  }).catch(() => undefined);
  return [position]
    .filter((found) => found !== undefined)
    .map((found) => regionAt([found.coords.latitude, found.coords.longitude]))
    .filter((region) => region !== '')
    .map((region) => `region:${region}`)
    .at(0) ?? fallback;
};
