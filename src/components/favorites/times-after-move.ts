import { branch } from '../../lib/branch.ts';
import { omitKey } from './omit-key.ts';
import { timeOfMinutes } from '../../lib/favorites/day-schedule.ts';
import type { Times } from '../../lib/favorites/day-schedule.ts';

const SLACK = 10; // minutes of drop tolerance before a pin is worth keeping

/** The pinned start times after a drag-to-reorder. A pin is a MINIMUM, so it
 *  can only ever open a gap: dropping a stop at or above the time the sequence
 *  gives it anyway is a plain reorder and clears any old pin. */
export const timesAfterMove = (
  times: Times,
  id: string,
  startMin: number,
  flowMin: number,
): Times =>
  branch(startMin > flowMin + SLACK)<Times>(
    () => ({ ...times, [id]: timeOfMinutes(startMin) }),
    () => omitKey(times, id),
  );
