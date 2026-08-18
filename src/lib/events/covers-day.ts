import { occursBetween } from './occurs-between.ts';
import type { CompactEvent } from './event-schema.ts';

/** An event covers a day when it happens on it (AC-2.3): inside the span for a
 *  standalone event, on a programmed date for a container. */
export const coversDay =
  (day: string) =>
  (event: CompactEvent): boolean =>
    occursBetween(day, day)(event);
