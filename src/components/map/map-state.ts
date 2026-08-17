import type { Category } from '../../lib/events/categories.ts';

/** Everything the map is filtered by right now, plus the day it opened on. The
 *  upper date bound is open by default ("until the very end") and clearable;
 *  the three layers are independent — both, either or neither can be on. */
export type MapState = {
  today: string;
  from: string;
  to: string;
  readonly selected: Set<Category>;
  freeOnly: boolean;
  gemsOnly: boolean;
  showEvents: boolean;
  showLandmarks: boolean;
  showPlaces: boolean;
};

/** Module-level, so the flows can read and write it without being handed it.
 *  readMapUrl() resets every field on each init, so a previous visit's filters
 *  never leak across an SPA swap. */
export const mapState: MapState = {
  today: '',
  from: '',
  to: '',
  selected: new Set<Category>(),
  freeOnly: false,
  gemsOnly: false,
  showEvents: true,
  showLandmarks: false,
  showPlaces: false,
};
