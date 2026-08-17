import { branch } from '../branch.ts';

/** Canonical path of a feed page — `liguria/` for a region, `liguria/genova/`
 *  once it is narrowed to a city. */
export const feedPath = (region: string, city?: string): string =>
  branch((city ?? '') !== '')(
    () => `${region}/${city}/`,
    () => `${region}/`,
  );
