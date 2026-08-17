import { branch } from '../branch.ts';
import { eventDuration } from './event-duration.ts';
import { minutesOfTime } from './minutes-of-time.ts';
import type { RouteStop } from './build-route.ts';

export type Window = Readonly<{ start: number; end: number }>;

// The event's official window: when it actually runs. Start from the corpus
// time; length is the source-stated duration or the category default — NOT the
// visitor's override, since an over-long visit is exactly what may overrun the
// close. Undefined for stops with no fixed time (they are always flexible).
export const officialWindow = (event: RouteStop): Window | undefined => {
  const start = minutesOfTime(event.h);
  return branch(start === undefined)<Window | undefined>(
    () => undefined,
    () => ({ start: start ?? 0, end: (start ?? 0) + eventDuration(event) }),
  );
};
