import type { Press } from './press.ts';

/** The control a load that starts `now` belongs to: the one pressed last, if it
 *  was pressed recently enough to have started it. */
export const pressedTarget =
  (windowMs: number) =>
  <T>(last: Press<T> | undefined, now: number): T | undefined =>
    [last].filter((press) => press !== undefined && now - press.at <= windowMs).at(0)?.target;
