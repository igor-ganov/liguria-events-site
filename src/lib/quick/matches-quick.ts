import { daysBetween } from '../calendar/days-between.ts';
import { reachesCutoff } from './reaches-cutoff.ts';
import type { QuickWindow } from './quick-window.ts';
import type { Timing } from './reaches-cutoff.ts';

/** A card as a quick filter reads it: the days it runs and its hours. */
export type QuickTiming = Timing & Readonly<{ start: string; end: string }>;

/**
 * Whether the event is on during the window: on some day of it that it
 * covers, and — where that day only counts from a given minute — on by then.
 * A run that covers a day with no cutoff is in, whatever its hours.
 */
export const matchesQuick = (window: QuickWindow, timing: QuickTiming): boolean =>
  daysBetween(window.from, window.to)
    .filter((day) => timing.start <= day && day <= timing.end)
    .some((day) => {
      const cutoff = window.cutoffs[day];
      return cutoff === undefined || reachesCutoff(timing, cutoff, window.untimed);
    });
