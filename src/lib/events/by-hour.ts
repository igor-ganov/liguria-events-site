import { byUniqueness } from './by-uniqueness.ts';
import type { CompactEvent } from './event-schema.ts';

/** The timed part of a day: by the hour ("HH:MM" compares as text), and at the
 *  same hour the old curation decides — made here, then the shorter run. */
export const byHour = (a: CompactEvent, b: CompactEvent): number =>
  (a.h ?? '').localeCompare(b.h ?? '') || byUniqueness(a, b);
