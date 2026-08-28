import type { CompactEvent } from '../events/event-schema.ts';

const shortDate = (iso: string): string => iso.replace(/^\d{4}-(\d{2})-(\d{2})$/, '$2.$1');

const present = (value: string | undefined): readonly string[] =>
  [value].filter((item): item is string => item !== undefined);

/**
 * When it is, and only when. The card gives the place a line of its own, and
 * the feed's formatter puts the venue on the end of the date — which put
 * "Palazzo Spinola" on the card twice.
 */
export const cardWhen = (event: CompactEvent): string =>
  [
    [event.s, ...present(event.e)].map(shortDate).join('–'),
    ...present(event.h),
  ].join(' · ');
