import type { Session } from './event-schema.ts';

/** One thing to go to on one day, and every hour it starts. */
export type SessionSlot = Readonly<{ session: Session; times: readonly string[] }>;

const keyOf = (session: Session): string => `${session.date}|${session.title ?? ''}`;

const timesOf = (group: readonly Session[]): readonly string[] =>
  [...new Set(group.map((session) => session.time).filter((time): time is string => time !== undefined))].sort();

const grouped = (sessions: readonly Session[]): ReadonlyMap<string, readonly Session[]> =>
  sessions.reduce(
    (groups, session) => groups.set(keyOf(session), [...(groups.get(keyOf(session)) ?? []), session]),
    new Map<string, readonly Session[]>(),
  );

/**
 * A programme folded by day and title: a visit that leaves at ten, eleven and
 * twenty past two is one slot with three times, not three sessions.
 *
 * Only the hours the sessions state themselves are kept. A session with no hour
 * of its own adds none — it would otherwise borrow the hour of the whole run,
 * and announce a start that nobody published.
 */
export const sessionSlots = (sessions: readonly Session[]): readonly SessionSlot[] =>
  [...grouped(sessions).values()].flatMap((group) =>
    group.slice(0, 1).map((session) => ({ session, times: timesOf(group) })),
  );
