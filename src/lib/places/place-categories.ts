/** Place categories — the "things to do / worth visiting" taxonomy the raw
 *  OSM tags and Overture categories are folded into. Drives icon, colour,
 *  filter chips. Distinct from event categories and landmark kinds. */
export const PLACE_CATEGORIES = [
  'restaurant',
  'cafe',
  'bar',
  'fastfood',
  'icecream',
  'nightlife',
  'fitness',
  'climbing',
  'sport',
  'cinema',
  'entertainment',
  'museum',
  'gallery',
  'wellness',
  'kids',
  'shopping',
] as const;

export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];
