import type { CompactEvent } from '../../../src/lib/events/event-schema.ts';

const dayMonth = (value: string): string =>
  new Date(`${value}T12:00:00Z`).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

/**
 * The date a weekly slide should show.
 *
 * Half the corpus is months-long runs. Printing their start date puts "10 apr"
 * on a video about this week, which reads as a stale post — the useful fact
 * about a run already open is when it closes.
 */
export const slideWhen = (event: CompactEvent, from: string): string =>
  event.s >= from
    ? dayMonth(event.s)
    : event.e === undefined
      ? 'in corso'
      : `fino al ${dayMonth(event.e)}`;
