import { placeKey } from './place-key.ts';
import { regionOf } from './region-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/** Where a city sits, averaged over the events held in it. */
export type Centroid = Readonly<{ lat: number; lng: number }>;

const located = (events: readonly CompactEvent[]): readonly Readonly<{ key: string; g: readonly [number, number] }>[] =>
  events
    .filter((event) => (event.ct ?? '') !== '')
    .flatMap((event) =>
      [event.g].filter((g): g is readonly [number, number] => g !== undefined).map((g) => ({
        key: placeKey(regionOf(event), event.ct ?? ''),
        g,
      })),
    );

const mean = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

/**
 * A point for every city that has located events, as the mean of those events'
 * coordinates. Good enough to answer "which of these is nearest to me": venues
 * cluster in the centre, and the cities are hundreds of kilometres apart.
 */
export const cityCentroids = (events: readonly CompactEvent[]): ReadonlyMap<string, Centroid> => {
  const points = located(events);
  return new Map(
    [...new Set(points.map((point) => point.key))].map((key) => {
      const mine = points.filter((point) => point.key === key).map((point) => point.g);
      return [key, { lat: mean(mine.map((g) => g[0])), lng: mean(mine.map((g) => g[1])) }];
    }),
  );
};
