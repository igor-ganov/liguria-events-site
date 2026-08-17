// The shapes the itinerary renderer is written against. Types only — every
// value that operates on them lives in its own sibling module.
import type { readUiIsland } from '../shared/read-ui-island.ts';
import type { Mode } from '../../lib/favorites/build-route.ts';
import type { DayBase } from '../../lib/favorites/base-point.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

export type Ui = ReturnType<typeof readUiIsland>['ui'];

/** Per-stop attendance overrides, in minutes, keyed by stop id. */
export type Durations = Readonly<Record<string, number>>;

export type LngLat = Readonly<{ lng: number; lat: number }>;

/** Everything a day section needs besides the day itself. */
export type ItineraryOpts = Readonly<{
  mode: Mode;
  lang: Locale;
  ui: Ui;
  overrides: Durations;
  baseOf?: ((day: string) => DayBase) | undefined;
}>;
