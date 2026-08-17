import { PLACE_CATEGORIES } from '../../lib/places/place-categories.ts';
import type { PlaceCategory } from '../../lib/places/place-categories.ts';

/** Whether a `data-pl-cat` chip names a category we actually have. */
export const isPlaceCategory = (value: string | undefined): value is PlaceCategory =>
  PLACE_CATEGORIES.some((cat) => cat === value);
