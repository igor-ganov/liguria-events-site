import type { Session } from './event-schema.ts';

/**
 * A container's own span: first to last programmed date. It is derived, never
 * typed in — the author states when the thing actually plays, and the run
 * follows. An empty programme yields nothing, so the caller keeps what it had.
 */
export const programmeSpan = (
  sessions: readonly Session[],
): Readonly<{ startDate: string; endDate: string }> | undefined =>
  [...sessions]
    .map((session) => session.date)
    .sort()
    .slice(0, 1)
    .map((first) => ({
      startDate: first,
      endDate: [...sessions].map((session) => session.date).sort().slice(-1).at(0) ?? first,
    }))
    .at(0);
