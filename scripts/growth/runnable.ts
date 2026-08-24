import { ADS } from './limits.ts';
import type { AdGroup } from './ad-group.ts';

/** A group that lost too many assets to the length limits cannot run: Google
 *  needs three headlines and two descriptions, and rejects the ad otherwise.
 *  Emitting it anyway turns one long place name into a failed import. */
export const runnable = (group: AdGroup): AdGroup | undefined =>
  group.headlines.length >= ADS.headlinesNeeded && group.descriptions.length >= ADS.descriptionsNeeded
    ? group
    : undefined;
