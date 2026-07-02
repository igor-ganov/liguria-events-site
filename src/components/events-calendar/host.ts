import type { CompactEvent } from '../../lib/events/event-schema.ts';

/** The mutable surface of the calendar element its free functions touch. */
export type CalendarHost = {
  monthKey: string;
  today: string;
  events: readonly CompactEvent[];
  readonly ctl: Readonly<{ init: () => void; prev: () => void; next: () => void }>;
};
