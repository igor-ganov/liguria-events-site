import { branch } from '../branch.ts';
import { regionOf } from './region-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/**
 * The events of one region — or, when no region is named, of the whole country.
 *
 * The feed, the calendar and the map all used to be a region's own, so an
 * address that named no region had to have one guessed for it. They exist for
 * the country now, and this is the one line that makes the same view serve both
 * scopes.
 */
export const eventsOfRegion = (
  events: readonly CompactEvent[],
  region: string,
): readonly CompactEvent[] =>
  branch(region === '')(
    () => events,
    () => events.filter((event) => regionOf(event) === region),
  );
