import { cityOf } from './city-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/** The feed and the calendar are a city's own; only the map spans the country. */
export const eventsOfCity = (
  events: readonly CompactEvent[],
  city: string,
): readonly CompactEvent[] => events.filter((event) => cityOf(event) === city);
