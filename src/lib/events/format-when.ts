import type { CompactEvent } from './event-schema.ts';

const shortDate = (isoDate: string): string =>
  isoDate.replace(/^\d{4}-(\d{2})-(\d{2})$/, '$2.$1');

const present = (value: string | undefined): readonly string[] =>
  [value].filter((item): item is string => item !== undefined);

const dateSpan = (event: CompactEvent): string =>
  [event.s, ...present(event.e)].map(shortDate).join('–');

/** '04.07–05.07 · 21:00 · Porto Antico' — omits unknown parts (AC-3.1). */
export const formatWhen = (event: CompactEvent): string =>
  [dateSpan(event), ...present(event.h), ...present(event.v)].join(' · ');
