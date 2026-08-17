// The shapes the route pipeline is written against. Types only — every value
// that operates on them lives in its own sibling module.
import type { CompactEvent } from '../events/event-schema.ts';

export type Mode = 'walking' | 'driving' | 'transit';

/** A [lat, lng] pair, as events and POIs carry it. */
export type Coords = readonly [number, number];

// A route stop is an event OR a landmark/place. Both share the fields the route
// pipeline needs (id, title, coords, duration); a POI adds `href` (its own
// detail link, since it isn't an /event/ page) and no date/time — it's
// available on any day of the trip.
export type RouteStop = CompactEvent & Readonly<{ href?: string }>;

/** One part of a real routed leg — a walk or a boarded vehicle. */
export type LegSegment = Readonly<{ mode: string; line?: string; to?: string; minutes: number }>;

export type Leg = Readonly<{
  meters: number;
  minutes: number;
  mapsUrl: string;
  /** The previous timed event plus travel overshoots this stop's start time. */
  tight: boolean;
  /** Real routed geometry as [lng, lat] pairs, once enriched from transit data
   *  (undefined for the straight-line estimate). */
  geometry?: readonly (readonly [number, number])[];
  /** true once upgraded from the straight-line estimate to real routing. */
  real?: boolean;
  /** Transfers on a real transit leg (undefined for walking/estimate). */
  transfers?: number;
  /** The multimodal breakdown (walk → bus → walk) of a real transit leg:
   *  each part's mode, line, destination and minutes, for a compact display. */
  segments?: readonly LegSegment[];
}>;

export type RouteDay = Readonly<{ day: string; stops: readonly RouteStop[]; legs: readonly Leg[] }>;

/** A saved route's explicit arrangement: one entry per day, event ids in the
 *  exact order the user arranged them. */
export type DayGroup = Readonly<{ day: string; ids: readonly string[] }>;

/** The trip window. `from` is the first day (the caller defaults it to today);
 *  `to` is optional — without it the trip runs to the last favourited day. */
export type DateRange = Readonly<{ from: string; to?: string }>;
