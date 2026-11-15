import { branch } from '../branch.ts';
import { isContainer } from './is-container.ts';
import { occurrenceOf } from './occurrence-of.ts';
import { sessionKey } from './session-key.ts';
import { sessionSlots } from './session-slots.ts';
import type { CompactEvent } from './event-schema.ts';

// The container with only the sessions whose occurrence passes, or nothing when
// none does. Judged slot by slot, with the hours the feed card will carry.
const narrowContainer = (keep: (occurrence: CompactEvent) => boolean, today: string, event: CompactEvent): readonly CompactEvent[] => {
  const sessions = (event.p ?? []).filter((session) => session.date >= today);
  const kept = new Set(
    sessionSlots(sessions)
      .filter((slot) => keep(occurrenceOf(event, slot)))
      .map((slot) => sessionKey(slot.session)),
  );
  return [{ ...event, p: sessions.filter((session) => kept.has(sessionKey(session))) }].filter(
    (narrowed) => (narrowed.p ?? []).length > 0,
  );
};

/**
 * Narrow an event to the occurrences that pass `keep`.
 *
 * A standalone event passes or not as a whole. A container is judged by each
 * of its nights — the day AND the hour that night starts — never by the
 * umbrella's run or the umbrella's hour, and keeps only the nights that pass:
 * a page about Sunday evening must not list the January and March nights of a
 * run whose first night is this Sunday, nor its Sunday morning.
 */
export const narrowOccurrences =
  (keep: (occurrence: CompactEvent) => boolean, today: string) =>
  (event: CompactEvent): readonly CompactEvent[] =>
    branch(isContainer(event))(
      () => narrowContainer(keep, today, event),
      () => [event].filter(keep),
    );
