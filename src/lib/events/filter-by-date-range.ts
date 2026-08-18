import { occursBetween } from './occurs-between.ts';
import type { CompactEvent } from './event-schema.ts';

/** Events that actually happen inside [from, to] — a span overlap for a
 *  standalone event, a programme hit for a container. The same test the map
 *  and the feed both use. */
export const filterByDateRange =
  (from: string, to: string) =>
  (events: readonly CompactEvent[]): readonly CompactEvent[] =>
    events.filter(occursBetween(from, to));
