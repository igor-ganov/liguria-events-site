// Region and city tallies are kept in one flat Map keyed `region|city`, so the
// counting stays a single pass. The separator must be a character no slug can
// contain (they are [a-z0-9-]), otherwise a region whose slug prefixes another's
// would collect the other's cities.
const SEP = '|';

/** The map key for a city under a region. `placeKey(region, '')` is also the
 *  prefix every city of that region starts with. */
export const placeKey = (region: string, city: string): string => `${region}${SEP}${city}`;
