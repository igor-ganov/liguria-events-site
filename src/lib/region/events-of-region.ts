import { regionOf } from './region-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/** The feed and the calendar are a region's own; only the map spans the country. */
export const eventsOfRegion = (
  events: readonly CompactEvent[],
  region: string,
): readonly CompactEvent[] => events.filter((event) => regionOf(event) === region);
