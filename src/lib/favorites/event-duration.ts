import { DEFAULT_DURATION_MIN } from './default-duration-min.ts';
import type { Category } from '../events/categories.ts';
import type { CompactEvent } from '../events/event-schema.ts';

export { formatDuration } from './format-duration.ts';

const FALLBACK_MIN = 90;

// A 0-or-1 array: only a stated, positive number of minutes counts, so a missing
// or non-positive value falls through to the next source.
const statedMinutes = (value: number | undefined): number | undefined =>
  [value]
    .filter((minutes): minutes is number => typeof minutes === 'number' && minutes > 0)
    .map((minutes) => Math.round(minutes))
    .at(0);

// The longest of the event's category defaults — nothing at all for an event
// carrying no categories, which is what makes the final fallback apply.
const categoryMinutes = (categories: readonly Category[]): number | undefined =>
  [categories.map((category) => DEFAULT_DURATION_MIN[category] ?? FALLBACK_MIN)]
    .filter((defaults) => defaults.length > 0)
    .map((defaults) => Math.max(...defaults))
    .at(0);

/** Attendance length in minutes: a manual override wins, then a source-stated
 *  duration (event.du), then the longest of the event's category defaults. */
export const eventDuration = (event: CompactEvent, overrideMin?: number): number =>
  statedMinutes(overrideMin) ?? statedMinutes(event.du) ?? categoryMinutes(event.c) ?? FALLBACK_MIN;
