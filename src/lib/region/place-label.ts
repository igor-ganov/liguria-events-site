import { branch } from '../branch.ts';
import { cityName } from './city-name.ts';
import { regionName } from './region-name.ts';

/** The display name of the place a feed page is scoped to: the city when the
 *  page has one, the region otherwise. */
export const placeLabel = (region: string, city?: string): string =>
  branch((city ?? '') !== '')(
    () => cityName(city ?? ''),
    () => regionName(region),
  );
