import type { HereTarget } from './here-target.ts';

/**
 * A resolved position as the push sender reads it.
 *
 * The town when the reader is genuinely in one — `hereTarget` gives up to the
 * region beyond a hundred kilometres — because the sender answers a city with
 * the town's own evening: `city:milano` is 51 events tonight where
 * `region:lombardia` is a count over 474 and a list from anywhere in it.
 */
export const placeOfTarget = (target: HereTarget): string =>
  [target.city ?? '']
    .filter((city) => city !== '')
    .map((city) => `city:${city}`)
    .concat([target.region].filter((region) => region !== '').map((region) => `region:${region}`))
    .at(0) ?? '';
