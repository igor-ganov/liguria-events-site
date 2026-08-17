import { daySection } from './day-section.ts';
import { stopOffset } from './stop-offset.ts';
import type { DayBase } from '../../lib/favorites/base-point.ts';
import type { Mode, RouteDay } from '../../lib/favorites/build-route.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Durations, Ui } from './render-types.ts';

/** The whole itinerary: one section per day, stops numbered across the trip. */
export const renderItinerary = (
  days: readonly RouteDay[],
  mode: Mode,
  lang: Locale,
  ui: Ui,
  overrides: Durations,
  baseOf?: (day: string) => DayBase,
): string => {
  const opts = { mode, lang, ui, overrides, baseOf };
  return days.map((day, i) => daySection(day, stopOffset(days, i), opts)).join('');
};
