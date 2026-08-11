import type { CompactEvent } from './event-schema.ts';

// An event's whole-day span in milliseconds: 0 for a one-day event. Shorter =
// more "unique" — the event pins to a moment instead of running through the
// window, so it should surface above the long, always-on multi-week runs.
export const spanMs = (event: CompactEvent): number => Date.parse(event.e ?? event.s) - Date.parse(event.s);
