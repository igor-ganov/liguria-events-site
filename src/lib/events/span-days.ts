import type { CompactEvent } from './event-schema.ts';

const DAY_MS = 86_400_000;

/** Inclusive length of the event in days. */
export const spanDays = (event: CompactEvent): number =>
  Math.round(
    (Date.parse(`${event.e ?? event.s}T12:00:00Z`) - Date.parse(`${event.s}T12:00:00Z`)) / DAY_MS,
  ) + 1;
