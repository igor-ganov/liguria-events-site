// A place id is an open-data id (osm:node/… | ovt:…); accept only that shape so
// the endpoint can't be used to write arbitrary keys.
const PLACE_ID = /^(osm:(node|way|relation)\/\d+|ovt:[a-z0-9]+)$/;

/** Whether a value is a well-formed open-data place id. */
export const isPlaceId = (value: unknown): value is string =>
  typeof value === 'string' && PLACE_ID.test(value);
