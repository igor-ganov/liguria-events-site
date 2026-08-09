// A favouritable id: an event (12-hex) OR a POI id — landmarks/places use
// wd:Q…, osm:node/…, osm:way/…, ovt:… which carry ':' and '/'. The namespaces
// are disjoint, so one favourites set holds all three without collision.
export const isFavId = (v: unknown): v is string =>
  typeof v === 'string' && /^[A-Za-z0-9:/_-]{1,80}$/.test(v);
