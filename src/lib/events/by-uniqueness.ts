import { madeHereRank } from './made-here-rank.ts';
import { spanMs } from './event-span.ts';
import type { CompactEvent } from './event-schema.ts';

// Made here first; then the unique, short events lead and the long exhibitions
// sink. A stable sort keeps the incoming chronological order as the tie-break,
// so equal-span events stay in start order. It orders the part of a day that
// is on all day, where no hour can.
export const byUniqueness = (a: CompactEvent, b: CompactEvent): number =>
  madeHereRank(a) - madeHereRank(b) || spanMs(a) - spanMs(b);
