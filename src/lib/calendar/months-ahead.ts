import { eventMonths } from './event-months.ts';
import { monthKeyOf } from './month-key-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/**
 * The calendar months worth advertising: this one and the ones to come.
 *
 * The calendar is BUILT for last month as well, because its own back arrow has
 * to land somewhere. Offering it is another matter — on 20 October the sitemap
 * was still handing Google sixty rows for September, a month whose answer is an
 * archive.
 */
export const monthsAhead = (events: readonly CompactEvent[], today: string): readonly string[] =>
  eventMonths(events, today).filter((month) => month >= monthKeyOf(today));
