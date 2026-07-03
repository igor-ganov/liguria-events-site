import type { Ui } from '../i18n/ui-schema.ts';

/** 'YYYY-MM' → localized 'July 2026' (AC-2.1) — pure, no Intl (ICU-stable). */
export const monthTitle =
  (ui: Ui) =>
  (monthKey: string): string => {
    const [year, month] = monthKey.split('-');
    return `${ui.months[Number(month) - 1] ?? ''} ${year ?? ''}`.trim();
  };
