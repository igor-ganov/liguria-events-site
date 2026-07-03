import type { Ui } from '../i18n/ui-schema.ts';

// Sunday = 0; the ui.weekdays array is Mon-first, so remap.
const MON_FIRST = [6, 0, 1, 2, 3, 4, 5] as const;

/** '2026-07-04' → localized 'Sat, 4 July' feed heading (AC-3.1); pure, no Intl. */
export const dayHeading =
  (ui: Ui) =>
  (isoDate: string): string => {
    const date = new Date(`${isoDate}T12:00:00Z`);
    const weekday = ui.weekdays[MON_FIRST[date.getUTCDay()] ?? 0] ?? '';
    const month = ui.months[date.getUTCMonth()] ?? '';
    return `${weekday}, ${date.getUTCDate()} ${month}`;
  };
