import { branch } from '../branch.ts';
import type { Session } from './event-schema.ts';

const compare = (a: string, b: string): number =>
  branch(a < b)(
    () => -1,
    () =>
      branch(a > b)(
        () => 1,
        () => 0,
      ),
  );

/** Sessions run in date order, and same-day sessions in clock order. */
export const bySessionOrder = (a: Session, b: Session): number =>
  compare(a.date, b.date) || (a.time ?? '').localeCompare(b.time ?? '');
