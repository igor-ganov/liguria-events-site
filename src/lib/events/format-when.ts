import { dateSpan } from './date-span.ts';
import type { CompactEvent } from './event-schema.ts';

const present = (value: string | undefined): readonly string[] =>
  [value].filter((item): item is string => item !== undefined);

/** '04.07–05.07 · 21:00 · Porto Antico' — omits unknown parts (AC-3.1). */
export const formatWhen = (event: CompactEvent): string =>
  [dateSpan(event), ...present(event.h), ...present(event.v)].join(' · ');
