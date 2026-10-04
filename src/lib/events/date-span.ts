import type { CompactEvent } from './event-schema.ts';

const shortDate = (isoDate: string): string => isoDate.replace(/^\d{4}-(\d{2})-(\d{2})$/, '$2.$1');

/** '04.07' for a single day, '04.07–05.07' for a run. */
export const dateSpan = (event: CompactEvent): string =>
  [event.s, ...[event.e].filter((end): end is string => end !== undefined)].map(shortDate).join('–');
