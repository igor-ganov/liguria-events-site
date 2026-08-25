import { branch } from '../branch.ts';
import type { CompactEvent } from './event-schema.ts';
import { spanMs } from './event-span.ts';

// Made here leads its day. Deliberately a tie-break inside a day group and
// never a boost across days: the feed answers "what is on", and lifting a
// platform event above a concert happening sooner would answer a different
// question. The day grouping itself is untouched.
const madeHere = (event: CompactEvent): number =>
  branch(event.pl === true)(
    () => 0,
    () => 1,
  );

// Then order a day's events so the unique, time-pinned happenings lead and the
// long exhibitions sink. A stable sort keeps the incoming chronological order
// as the tie-break, so equal-span events stay in start order.
export const byUniqueness = (a: CompactEvent, b: CompactEvent): number =>
  madeHere(a) - madeHere(b) || spanMs(a) - spanMs(b);
