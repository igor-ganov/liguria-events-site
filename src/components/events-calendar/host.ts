import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

/** The mutable surface of the calendar element its free functions touch. */
export type CalendarHost = {
  monthKey: string;
  today: string;
  locale: Locale;
  ui: Ui;
  events: readonly CompactEvent[];
  readonly ctl: Readonly<{ init: () => void; prev: () => void; next: () => void }>;
};
