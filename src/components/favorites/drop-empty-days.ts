import type { DayGroup } from '../../lib/favorites/build-route.ts';

/** Days left without a single stop drop out, so the itinerary never shows a
 *  blank day. */
export const dropEmptyDays = (groups: readonly DayGroup[]): readonly DayGroup[] =>
  groups.filter((group) => group.ids.length > 0);
