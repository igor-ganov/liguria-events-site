import type { Category } from '../events/categories.ts';

/** Default attendance length per category (minutes), used when the source did
 *  not state one. A multi-category event takes the LONGEST of its types. */
export const DEFAULT_DURATION_MIN: Readonly<Record<Category, number>> = {
  nightlife: 180,
  music: 150,
  theatre: 150,
  sport: 150,
  food: 120,
  workshop: 120,
  art: 90,
  culture: 90,
  family: 90,
  other: 90,
  market: 60,
};
