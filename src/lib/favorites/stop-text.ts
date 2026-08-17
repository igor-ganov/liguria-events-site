import { eventDuration, formatDuration } from './event-duration.ts';
import { titleOf } from '../events/title-of.ts';
import type { RouteStop } from './build-route.ts';
import type { PdfOpts } from './pdf-line-types.ts';

/** One numbered stop as a line: '3. 18:00  Concert — Teatro  (1h 30m)'. */
export const stopText = (stop: RouteStop, n: number, opts: PdfOpts): string => {
  const time = (stop.h && `${stop.h}  `) || '';
  const venue = (stop.v && ` — ${stop.v}`) || '';
  const duration = formatDuration(eventDuration(stop, opts.durations[stop.id]));
  return `${n}. ${time}${titleOf(opts.lang)(stop)}${venue}  (${duration})`;
};
