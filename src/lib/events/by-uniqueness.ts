import type { CompactEvent } from './event-schema.ts';
import { spanMs } from './event-span.ts';

// Order a day's events so the unique, time-pinned happenings lead and the long
// exhibitions sink. A stable sort keeps the incoming chronological order as the
// tie-break, so equal-span events stay in start order.
export const byUniqueness = (a: CompactEvent, b: CompactEvent): number => spanMs(a) - spanMs(b);
