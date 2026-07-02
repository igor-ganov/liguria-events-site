import type { CompactEvent } from './event-schema.ts';
import { spanDays } from './span-days.ts';

const LONG_RUNNING_DAYS = 3;

/** Longer than 3 days → "Ongoing" list, not every day cell (AC-2.3). */
export const isLongRunning = (event: CompactEvent): boolean =>
  spanDays(event) > LONG_RUNNING_DAYS;
