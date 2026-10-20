import { regionName } from './region-name.ts';

/**
 * What to call the place a page covers: its region, or the country when it
 * covers the country.
 *
 * The calendar and the map used to exist only inside a region, so the region's
 * name was the only answer there could be. Now that they also exist for the
 * whole of Italy, a page with no region still has to be able to say what it is
 * a calendar OF.
 */
export const scopeName = (country: string, region: string): string =>
  [region].filter((slug) => slug !== '').map(regionName).at(0) ?? country;
