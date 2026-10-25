import { branch } from '../branch.ts';
import type { CompactEvent } from './event-schema.ts';

const latest = (days: readonly string[]): string => days.toSorted().at(-1) ?? '';

/**
 * The next day a reader can go: today for a run already open, the first day
 * for one still ahead, and the next session for a container, which is on
 * nothing in between. A tile dated by the opening day called a season that
 * opened in February "6 Feb" in October.
 */
export const nextDayOn =
  (today: string) =>
  (event: CompactEvent): string =>
    branch(event.k === true)(
      () => (event.p ?? []).map((session) => session.date).filter((date) => date >= today).toSorted().at(0) ?? event.s,
      () => latest([event.s, today]),
    );
