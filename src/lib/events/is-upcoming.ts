import { occursBetween } from './occurs-between.ts';
import type { CompactEvent } from './event-schema.ts';

/** Still to come: some of the event falls on today or later. For a container
 *  that means a session is still ahead, not merely that the advertised run has
 *  not lapsed. */
export const isUpcoming =
  (today: string) =>
  (event: CompactEvent): boolean =>
    occursBetween(today, '')(event);
