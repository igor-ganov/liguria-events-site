import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { DateRange, Mode, RouteDay, RouteStop } from '../../lib/favorites/build-route.ts';
import type { DayHours } from '../../lib/favorites/day-hours.ts';
import type { Durations, Times } from '../../lib/favorites/day-schedule.ts';
import type { RouteView } from './to-view.ts';

/** Everything the favourites-page route generator carries between events: the
 *  chosen mode/view, the resolved stops, the arrangement the user dragged into
 *  place (order, pinned times, breaks, durations) and the last built route.
 *  `gen` bumps per generation so a stale async enrichment cannot repaint. */
export type GenState = {
  mode: Mode;
  view: RouteView;
  byId: ReadonlyMap<string, RouteStop>;
  corpus: readonly CompactEvent[] | undefined;
  durations: Durations;
  order: Readonly<Record<string, readonly string[]>>;
  times: Times;
  pauses: Durations;
  dayHours: Readonly<Record<string, DayHours>>;
  days: readonly RouteDay[];
  range: DateRange;
  gen: number;
};

export const genState: GenState = {
  mode: 'walking',
  view: 'list',
  byId: new Map(),
  corpus: undefined,
  durations: {},
  order: {},
  times: {},
  pauses: {},
  dayHours: {},
  days: [],
  range: { from: '' },
  gen: 0,
};
