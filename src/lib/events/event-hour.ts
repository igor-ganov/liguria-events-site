import { branch } from '../branch.ts';
import { isContainer } from './is-container.ts';
import type { CompactEvent } from './event-schema.ts';

// The hour every night of a container starts at, when they all agree. A night
// with no hour of its own starts at the umbrella's (expandSessions does the same).
const sharedHour = (event: CompactEvent): string | undefined => {
  const hours = new Set((event.p ?? []).map((session) => session.time ?? event.h));
  return [...hours].filter(() => hours.size === 1).at(0);
};

/**
 * The one hour an event can be printed with as "starts at".
 *
 * A standalone event's own. A container's only when every night starts then:
 * its umbrella hour describes the run in general, and where the nights say
 * otherwise ("Mostra della Zucca": 18:00 on the umbrella, 10:00 every morning)
 * printing it sends the reader at the wrong hour. The programme lists the
 * nights' own hours.
 */
export const eventHour = (event: CompactEvent): string | undefined =>
  branch(isContainer(event))(
    () => sharedHour(event),
    () => event.h,
  );
