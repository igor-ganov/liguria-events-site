import { readGlobalBase, resolveDayBase } from '../../lib/favorites/base-point.ts';
import type { DayBase } from '../../lib/favorites/base-point.ts';

/** A generated route honours the traveller's GLOBAL base (departure/return);
 *  route- and per-day bases are set on the saved-route editor. */
export const genBaseOf = (day: string): DayBase =>
  resolveDayBase(day, {}, undefined, readGlobalBase(), {});
