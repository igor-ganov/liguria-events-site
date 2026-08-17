// Types for the real-routing side of the pipeline (Transitous/MOTIS via the
// shared italian-transport-core package).
import type { BestLeg, Place, TravelMode } from 'italian-transport-core';
import type { LegSegment, RouteStop } from './route-types.ts';

/** A journey planner: real walk/transit routing between two points. */
export type Planner = (from: Place, to: Place, mode: TravelMode) => Promise<BestLeg | undefined>;

// The routing result for one origin→destination pair, cached so reorders and
// drags reuse it instead of re-hitting Transitous. `tight` is deliberately not
// cached — it is recomputed against the current fixed times on apply.
export interface RoutedLeg {
  readonly meters: number;
  readonly minutes: number;
  readonly geometry: readonly (readonly [number, number])[];
  readonly transfers: number;
  readonly segments: readonly LegSegment[];
}

/** A directed pair of stops awaiting (or holding) real routing. */
export type LegPair = Readonly<{ from: RouteStop; to: RouteStop }>;
