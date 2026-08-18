import type { CompactEvent } from './event-schema.ts';
import { isContainer } from './is-container.ts';
import { spanDays } from './span-days.ts';

const LONG_RUNNING_DAYS = 3;

/**
 * Longer than 3 days → "Ongoing" list, not every day cell (AC-2.3).
 *
 * A container is never long-running however wide its programme spreads: nothing
 * runs between its evenings, so it belongs in the cell of each night it plays
 * rather than in a list of things going on all month.
 */
export const isLongRunning = (event: CompactEvent): boolean =>
  !isContainer(event) && spanDays(event) > LONG_RUNNING_DAYS;
