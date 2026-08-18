import { branch } from '../branch.ts';
import { isContainer } from './is-container.ts';
import { sessionDates } from './session-dates.ts';
import type { CompactEvent } from './event-schema.ts';

// A span overlaps the window unless it ends before it starts or starts after it
// ends. An empty bound is open-ended: empty `to` means "until the very end",
// empty `from` means "from the very start".
const spanOverlaps = (from: string, to: string, event: CompactEvent): boolean =>
  (to === '' || event.s <= to) && (from === '' || (event.e ?? event.s) >= from);

/**
 * Does the event actually happen inside [from, to]?
 *
 * For a standalone event that is span overlap. For a container it is the
 * programme: a festival with evenings on the 5th and the 20th does NOT happen
 * on the 12th, and a filter pinned to the 12th must not return it.
 */
export const occursBetween =
  (from: string, to: string) =>
  (event: CompactEvent): boolean =>
    branch(isContainer(event))(
      () => sessionDates(event).some((date) => (from === '' || date >= from) && (to === '' || date <= to)),
      () => spanOverlaps(from, to, event),
    );
