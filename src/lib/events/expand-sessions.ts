import { branch } from '../branch.ts';
import { isContainer } from './is-container.ts';
import { sessionSlots } from './session-slots.ts';
import type { CompactEvent, Session } from './event-schema.ts';
import type { SessionSlot } from './session-slots.ts';

// The hours of a slot: the first one leads (it is what a day is sorted by), and
// the whole list rides along only when there is more than one to choose from.
const hoursOf = (times: readonly string[]): Partial<Pick<CompactEvent, 'h' | 'hs'>> => ({
  ...times.slice(0, 1).reduce((_, first) => ({ h: first }), {}),
  ...branch(times.length > 1)(
    () => ({ hs: times }),
    () => ({}),
  ),
});

// One occurrence: a one-day event on the slot's date. The run (`e`) and the
// programme (`p`) are cleared; the slot's own hours and title (when named)
// override the umbrella's, dropping its localized title so it can't win.
const occurrenceOf = (event: CompactEvent, { session, times }: SessionSlot): CompactEvent => ({
  ...event,
  e: undefined,
  p: undefined,
  k: undefined,
  s: session.date,
  ...hoursOf(times),
  ...branch(session.title === undefined)(
    () => ({}),
    () => ({ t: session.title ?? event.t, tl: undefined }),
  ),
});

// The upcoming slots as occurrences, or the umbrella itself when none are left
// (all past / not yet programmed) so it is never dropped from the feed.
const occurrencesOf = (event: CompactEvent, sessions: readonly Session[], today: string): readonly CompactEvent[] => {
  const upcoming = sessionSlots(sessions.filter((session) => session.date >= today)).map((slot) =>
    occurrenceOf(event, slot),
  );
  return branch(upcoming.length === 0)(
    () => [event],
    () => upcoming,
  );
};

/**
 * Turn a container into one occurrence per upcoming day-and-title, so the feed
 * and the calendar show the specific concert on its night instead of the whole
 * June–October run keyed to today — and show a visit that starts three times
 * in a day once, with its three hours, rather than three times.
 *
 * Standalone events pass through even when they list a programme: a museum that
 * runs guided tours on Saturdays is still open the rest of the week, and
 * expanding it would erase it from those days.
 */
export const expandSessions = (events: readonly CompactEvent[], today: string): readonly CompactEvent[] =>
  events.flatMap((event) =>
    branch(isContainer(event))(
      () => occurrencesOf(event, event.p ?? [], today),
      () => [event],
    ),
  );
