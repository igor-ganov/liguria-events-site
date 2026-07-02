import type { CompactEvent } from './event-schema.ts';

/** An event covers a day when s ≤ day ≤ (e ?? s) (AC-2.3). */
export const coversDay =
  (day: string) =>
  (event: CompactEvent): boolean =>
    event.s <= day && day <= (event.e ?? event.s);
