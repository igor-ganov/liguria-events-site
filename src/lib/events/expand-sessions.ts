import { branch } from '../branch.ts';
import type { CompactEvent, Session } from './event-schema.ts';

// One occurrence: a one-day event on the session's date. The run (`e`) and the
// programme (`p`) are cleared; the session's own time and title (when named)
// override the umbrella's, dropping its localized title so it can't win.
const occurrenceOf = (event: CompactEvent, session: Session): CompactEvent => ({
  ...event,
  e: undefined,
  p: undefined,
  s: session.date,
  ...branch(session.time === undefined)(
    () => ({}),
    () => ({ h: session.time }),
  ),
  ...branch(session.title === undefined)(
    () => ({}),
    () => ({ t: session.title ?? event.t, tl: undefined }),
  ),
});

// The upcoming sessions as occurrences, or the umbrella itself when none are
// left (all past / not yet programmed) so it is never dropped from the feed.
const occurrencesOf = (
  event: CompactEvent,
  sessions: readonly Session[],
  today: string,
): readonly CompactEvent[] => {
  const upcoming = sessions.filter((session) => session.date >= today).map((session) => occurrenceOf(event, session));
  return branch(upcoming.length === 0)(
    () => [event],
    () => upcoming,
  );
};

/**
 * Turn an umbrella event that carries a dated programme (`p`) into one occurrence
 * per upcoming session, so the feed and calendar show the specific concert on its
 * night instead of the whole June–October run keyed to today. Events without a
 * programme pass through unchanged.
 */
export const expandSessions = (
  events: readonly CompactEvent[],
  today: string,
): readonly CompactEvent[] =>
  events.flatMap((event) =>
    branch(event.p === undefined || event.p.length === 0)(
      () => [event],
      () => occurrencesOf(event, event.p ?? [], today),
    ),
  );
