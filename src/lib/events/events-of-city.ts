import { branch } from '../branch.ts';
import type { CompactEvent } from './event-schema.ts';

/** A city page pre-filters to that city on the server, so there is no
 *  client-side flash from region → city. Without a city, nothing is dropped. */
export const eventsOfCity = (
  events: readonly CompactEvent[],
  city?: string,
): readonly CompactEvent[] =>
  branch((city ?? '') !== '')(
    () => events.filter((event) => event.ct === city),
    () => events,
  );
