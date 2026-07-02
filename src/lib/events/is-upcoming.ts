import type { CompactEvent } from './event-schema.ts';

export const isUpcoming =
  (today: string) =>
  (event: CompactEvent): boolean =>
    (event.e ?? event.s) >= today;
